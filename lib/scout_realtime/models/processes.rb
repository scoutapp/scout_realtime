class Scout::Realtime::Processes < Scout::Realtime::Metric
  include Scout::Realtime::MultiAggregator

  FIELDS = { :cpu              => {'label'=>'CPU usage', 'units'=>'%', 'precision'=>2},
             :memory           => {'units'=>'MB', 'precision'=>1},
             :count            => {'units'=>'', 'precision'=>0}
           }

  def initialize
    @collector = ServerMetrics::Processes.new()
    super
  end
end
