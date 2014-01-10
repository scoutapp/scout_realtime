class Scout::Realtime::Memory < Scout::Realtime::Metric
  include Scout::Realtime::Aggregator

  FIELDS = { :size              => {'label'=>'Memory Total', 'units'=>'MB', 'precision'=>0},
             :used              => {'label'=>'Memory Used', 'units'=>'MB', 'precision'=>0},
             :avail             => {'label'=>'Memory Available', 'units'=>'MB', 'precision'=>0},
             :used_percent      => {'label'=>'% Memory Used', 'units'=>'%', 'precision'=>0},
             :swap_size         => {'label'=>'Swap Total', 'units'=>'MB', 'precision'=>0},
             :swap_used         => {'label'=>'Swap Used', 'units'=>'MB', 'precision'=>0},
             :swap_used_percent => {'label'=>'% Swap Used', 'units'=>'%', 'precision'=>0}
           }

  def initialize
    @collector = ServerMetrics::Memory.new()
    super
  end
end
