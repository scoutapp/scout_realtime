class Scout::Realtime::Metric
  attr_accessor :historical_metrics

  def initialize
    @historical_metrics = Hash.new
  end

  def run
    collector_response = @collector.run
    aggregate(collector_response)
    collector_response
  end
end
