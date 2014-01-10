module Scout
  module Realtime
    class Runner
      attr_accessor :num_runs

      def initialize
        @num_runs = 0
        @collectors = Scout::Realtime::Metric.descendants.map(&:new)
      end

      def run
        @collectors.each(&:run!)
        @num_runs += 1
      end

      def latest_run
        gather_from_collectors(:latest_run)
      end

      def historical_metrics
        gather_from_collectors(:historical_metrics)
      end

      private
        def gather_from_collectors(value)
          @collectors.inject({}) do |collection, collector|
            name = collector.class.short_name
            collection[name] = collector.send(value)
            collection
          end
        end
    end
  end
end
