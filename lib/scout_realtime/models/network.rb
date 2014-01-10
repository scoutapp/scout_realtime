class Scout::Realtime::Network < Scout::Realtime::Metric
  include Scout::Realtime::MultiAggregator

  FIELDS = { :bytes_in =>    { 'units' => 'KB/s', 'precision' => '0' },
             :bytes_out =>   { 'units' => 'KB/s', 'precision' => '0' },
             :packets_in =>  { 'units' => 'pkts/s', 'precision' => '0' },
             :packets_out => { 'units' => 'pkts/s', 'precision' => '0'  }
           }

  def initialize
    @collector = ServerMetrics::Network.new()
    super
  end
end
