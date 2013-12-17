module Scout
  module Realtime
    class Runner
      attr_accessor :num_runs
      attr_accessor :latest_run
      attr_accessor :historical_metrics

      def initialize
        @latest_run = {}
        @historical_metrics = {}
        @num_runs = 0

        @memory = Scout::Realtime::Memory.new
        @disks = Scout::Realtime::Disk.new()
        @cpu   = Scout::Realtime::Cpu.new()
        @networks = Scout::Realtime::Network.new()
        #@processes = ServerMetrics::Processes.new()

        @system_info = ServerMetrics::SystemInfo.to_h
      end

      def run
        collector_res={}      
        collector_meta={}
        historical_metrics={}
        #[@disks,@cpu,@memory,@networks,@processes].each do |collector|
        [@memory, @disks, @cpu, @networks].each do |collector|
          name=collector.class.name.split("::").last.downcase.to_sym
          start_time=Time.now
          begin
            collector_res[name] = collector.run
            historical_metrics[name] = collector.historical_metrics
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
        @historical_metrics = historical_metrics
        @num_runs +=1
      end
    end
  end
end