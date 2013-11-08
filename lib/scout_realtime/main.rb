Thread.abort_on_exception=true

module Scout
  module Realtime
    class Main
      INTERVAL=1
      LOG_NAME="realtime.log"

      attr_accessor :running, :collector, :stats_thread

      def initialize(opts={})
        home_dir_path = File.expand_path("~")
        if opts[:stdout]
          puts " ** Initializing. cntl-c to stop. Logging to STDOUT **"
          Scout::Realtime::logger=Logger.new(STDOUT)
        else
          puts " ** Initializing. cntl-c to stop. See logs in #{home_dir_path}/ **"
          Scout::Realtime::logger=Logger.new(File.join(home_dir_path, LOG_NAME))
        end

        @home_dir = File.exist?(home_dir_path) ? File.new(home_dir_path) : Dir.mkdir(home_dir_path)
        @stats_thread = Thread.new {}
        @collector = Scout::Realtime::Runner.new
      end

      def start_thread
        return if @running
        logger.info("starting stats collector thread")
        @running = true
        @stats_thread = Thread.new do
          while (@running) do
            @collector.run
            logger.info("collector thread run ##{@collector.num_runs} ") if @collector.num_runs.to_f % 50.0 == 0 || @collector.num_runs == 1
            sleep INTERVAL
          end
        end

      end

      def stop_thread!
        logger.info("stopping collector thread")
        @running=false
      end

      def go_sinatra
        @collector.run # sets up the latest_run so we can use it to render the main page
        @collector.latest_run=DATA_FOR_TESTING.first
        logger.info("starting web server ")
        Scout::Realtime::WebApp.run!
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
