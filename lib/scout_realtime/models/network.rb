class Scout::Realtime::Network

  FIELDS = [ { :bytes_in =>    { 'units' => 'KB/s', 'precision' => '0' } },
             { :bytes_out =>   { 'units' => 'KB/s', 'precision' => '0' } },
             { :packets_in =>  { 'units' => 'pkts/s', 'precision' => '0' } },
             { :packets_out => { 'units' => 'pkts/s', 'precision' => '0'  } } ]

  attr_reader :historical_metrics

  def initialize
    @collector = ServerMetrics::Network.new()
    @historical_metrics = Hash.new
  end

  def run
    res = @collector.run
    # since this is a multi-collector, the first level of the result hash is name
    res.each_pair do |name,metrics_hash|
      @historical_metrics[name] ||= {}
      self.class.fields.each do |field|
        @historical_metrics[name][field.name] ||= RingBuffer.new(60)
        @historical_metrics[name][field.name].push(metrics_hash[field.name])
      end
    end

    res
  end

  def self.fields
    const_get(:FIELDS).map{|h| Scout::Realtime::Field.new(h) }
  end

end