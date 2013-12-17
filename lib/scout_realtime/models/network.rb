require_relative "metric_source"
class Scout::Realtime::Network < Scout::Realtime::MetricSource

  FIELDS = [ { :bytes_in =>    { 'units' => 'KB/s', 'precision' => '0' } },
             { :bytes_out =>   { 'units' => 'KB/s', 'precision' => '0' } },
             { :packets_in =>  { 'units' => 'pkts/s', 'precision' => '0' } },
             { :packets_out => { 'units' => 'pkts/s', 'precision' => '0'  } } ]

end