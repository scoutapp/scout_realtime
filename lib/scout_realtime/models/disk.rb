class Scout::Realtime::Disk < Scout::Realtime::Metric
  include Scout::Realtime::MultiAggregator

  FIELDS = {:size =>         {'label'=>'Disk Size', 'units'=>'GB', 'precision'=>0},
            :used =>         {'label'=>'Disk Space Used', 'units'=>'GB', 'precision'=>0},
            :avail =>        {'label'=>'Disk Space Available', 'units'=>'GB', 'precision'=>0},
            :used_percent => {'label'=>'Disk Capacity', 'units'=>'%', 'precision'=>0},
            :utilization =>  {'label'=>'Utilization', 'units'=>'%', 'precision'=>0},
            :await =>        {'label'=>'I/O Wait', 'units'=>'ms', 'precision'=>1},
            :wps =>          {'label'=>'Writes/sec', 'precision'=>0},
            :rps_kb =>       {'label'=>'Read kBps', 'units'=>'kB/s', 'precision'=>1},
            :average_queue_length => {'label'=>'Average Queue Size', 'precision'=>1},
            :wps_kb =>       {'label'=>'Write kBps', 'units'=>'kB/s', 'precision'=>1},
            :rps =>          {'label'=>'Reads/sec', 'precision'=> 0}
           }

  def initialize
    @collector = ServerMetrics::Disk.new(:ttl => Scout::Realtime::Main::TTL)
    super
  end
end
