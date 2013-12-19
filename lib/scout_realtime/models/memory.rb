class Scout::Realtime::Memory

  FIELDS = [ { :size              => {'label'=>'Memory Total', 'units'=>'MB', 'precision'=>0}},
             { :used              => {'label'=>'Memory Used', 'units'=>'MB', 'precision'=>0}},
             { :avail             => {'label'=>'Memory Available', 'units'=>'MB', 'precision'=>0}},
             { :used_percent      => {'label'=>'% Memory Used', 'units'=>'%', 'precision'=>0}},
             { :swap_size         => {'label'=>'Swap Total', 'units'=>'MB', 'precision'=>0}},
             { :swap_used         => {'label'=>'Swap Used', 'units'=>'MB', 'precision'=>0}},
             { :swap_used_percent => {'label'=>'% Swap Used', 'units'=>'%', 'precision'=>0}} ]

  attr_reader :historical_metrics

  def initialize
    @collector = ServerMetrics::Memory.new()
    @historical_metrics = Hash.new
  end

  def run
    res = @collector.run

    self.class.fields.each do |field|
      @historical_metrics[field.name] ||= RingBuffer.new(60)
      @historical_metrics[field.name].push(res[field.name])
    end

    res
  end

  def self.fields
    const_get(:FIELDS).map{|h| Scout::Realtime::Field.new(h) }
  end

end