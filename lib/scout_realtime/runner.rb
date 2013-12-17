module Scout
  module Realtime
    class Runner
      attr_accessor :num_runs
      attr_accessor :latest_run
      attr_accessor :metrics

      def initialize
        @latest_run = {}
        @num_runs = 0

        @disks = ServerMetrics::Disk.new()
        @cpu   = ServerMetrics::Cpu.new()
        @memory = ServerMetrics::Memory.new()
        @networks = ServerMetrics::Network.new()
        @processes = ServerMetrics::Processes.new()

        @memory_store = Scout::Realtime::Memory.new

        @system_info = ServerMetrics::SystemInfo.to_h
      end

      def run
        collector_res={}
        collector_meta={}
        [@disks,@cpu,@memory,@networks,@processes].each do |collector|
          name=collector.class.name.split("::").last.downcase.to_sym
          start_time=Time.now
          begin
            collector_res[name] = collector.run
            if name == :memory
              @memory_store.add_metrics(collector_res[name])
              puts @memory_store.buffers.to_json
            end
          rescue => e
            raise e
          end
          collector_meta[name] = {
              :duration => ((Time.now-start_time)*1000).to_i # milliseconds
          }
        end

        latest_run = collector_res
        latest_run.merge!(:collector_meta => collector_meta)
        latest_run.merge!(:system_info => @system_info.merge(:server_time => Time.now.strftime("%I:%M:%S %p"), :server_unixtime => Time.now.to_i))

        @latest_run=latest_run
        @num_runs +=1
      end
    end
  end
end