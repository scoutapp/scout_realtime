module Scout
  module Realtime
    class Main
      INTERVAL=3 # time in seconds between runs of the thread to fetch stats
      TTL=60 # time in seconds for collectors to cache slow system commands
      LOG_NAME="realtime.log"

      attr_accessor :running, :runner, :stats_thread, :enable_basic_auth

      # opts: {:port=>xxx}
      def initialize(opts={})
        @enable_basic_auth=opts[:enable_basic_auth]
        @port=opts[:port]
        Scout::Realtime::logger=Logger.new(STDOUT)
        @stats_thread = Thread.new {}
        @runner = Scout::Realtime::Runner.new
      end

      def start_thread
        return if @running
        logger.info("starting stats collector thread")
        @running = true
        @stats_thread = Thread.new do
          while (@running) do
            @runner.run
            logger.info("collector thread run ##{@runner.num_runs} ")  if @runner.num_runs.to_f % 50.0 == 2 || @runner.num_runs == 1
            sleep INTERVAL
          end
        end
        @stats_thread.abort_on_exception = true

      end

      def stop_thread!
        logger.info("stopping collector thread")
        @running=false
      end

      def go_sinatra
        #@runner.run # sets up the latest_run so we can use it to render the main page
        #@runner.latest_run=DATA_FOR_TESTING.first

        logger.info("starting web server ")

        #['INT', 'TERM'].each do |signal|
        #  trap signal do
        #    puts "got a #{signal} signal -- shutting down :)"
        #    @stats_thread.exit
        #    #Scout::Realtime::WebApp.quit! #
        #  end
        #end

        start_thread
        Scout::Realtime::WebApp.run!(:port=>@port)
      end

      def go_webrick
        logger.info("starting web server ")
        server = WEBrick::HTTPServer.new(:Port => 5555, :AccessLog => [])
        server.mount '/', Scout::Realtime::WebServer
        trap 'INT' do
          server.shutdown
        end
        #start_thread
        server.start # blocking
      end

      # singleton
      def self.instance(opts={})
        @@instance ||= self.new(opts)
      end

      def logger
        Scout::Realtime::logger
      end
    end
  end
end
