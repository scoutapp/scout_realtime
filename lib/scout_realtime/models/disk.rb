class Scout::Realtime::Disk

  FIELDS = [ {:size =>         {'label'=>'Disk Size', 'units'=>'GB', 'precision'=>0} },
             {:used =>         {'label'=>'Disk Space Used', 'units'=>'GB', 'precision'=>0} },
             {:avail =>        {'label'=>'Disk Space Available', 'units'=>'GB', 'precision'=>0} },
             {:used_percent => {'label'=>'Disk Capacity', 'units'=>'%', 'precision'=>0 }},
             {:utilization =>  {'label'=>'Utilization', 'units'=>'%', 'precision'=>0} },
             {:await =>        {'label'=>'I/O Wait', 'units'=>'ms', 'precision'=>1} },
             {:wps =>          {'label'=>'Writes/sec', 'precision'=>0} },
             {:rps_kb =>       {'label'=>'Read kBps', 'units'=>'kB/s', 'precision'=>1} },
             {:average_queue_length => {'label'=>'Average Queue Size', 'precision'=>1} },
             {:wps_kb =>       {'label'=>'Write kBps', 'units'=>'kB/s', 'precision'=>1} },
             {:rps =>          {'label'=>'Reads/sec', 'precision'=> 0} } ]

  attr_reader :historical_metrics

  def initialize
    @collector = ServerMetrics::Disk.new()
    @historical_metrics = Hash.new
  end

  def run
    res = @collector.run
    # since this is a multi-collector, the first level of the result hash is name
    res.each_pair do |name,metrics_hash|
      @historical_metrics[name] ||= {}
      self.class.fields.each do |field|
        @historical_metrics[name][field.name] ||= RingBuffer.new(30)
        @historical_metrics[name][field.name].push(metrics_hash[field.name])
      end
    end

    res
  end

  def self.fields
    const_get(:FIELDS).map{|h| Scout::Realtime::Field.new(h) }
  end

end