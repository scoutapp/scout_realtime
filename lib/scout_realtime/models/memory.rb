require_relative "metric_source"
class Scout::Realtime::Memory < Scout::Realtime::MetricSource

  FIELDS = [ { :size              => {'label'=>'Memory Total', 'units'=>'MB', 'precision'=>0}},
             { :used              => {'label'=>'Memory Used', 'units'=>'MB', 'precision'=>0}},
             { :avail             => {'label'=>'Memory Available', 'units'=>'MB', 'precision'=>0}},
             { :used_percent      => {'label'=>'% Memory Used', 'units'=>'%', 'precision'=>0}},
             { :swap_size         => {'label'=>'Swap Total', 'units'=>'MB', 'precision'=>0}},
             { :swap_used         => {'label'=>'Swap Used', 'units'=>'MB', 'precision'=>0}},
             { :swap_used_percent => {'label'=>'% Swap Used', 'units'=>'%', 'precision'=>0}} ]

  attr_reader :historical_metrics

end