class Scout::Realtime::Network

  FIELDS = [ { :bytes_in =>    { 'units' => 'KB/s', 'precision' => '0' } },
             { :bytes_out =>   { 'units' => 'KB/s', 'precision' => '0' } },
             { :packets_in =>  { 'units' => 'pkts/s', 'precision' => '0' } },
             { :packets_out => { 'units' => 'pkts/s', 'precision' => '0'  } } ]

  def self.fields
    FIELDS.map{|h| Scout::Realtime::Field.new(h) }
  end

end