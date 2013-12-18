class Scout::Realtime::Cpu

  FIELDS = [ { :user                  => { 'units' => '%', 'precision' => 1 } },
             { :system                => { 'units' => '%', 'precision' => 1 } },
             { :idle                  => { 'units' => '%', 'precision' => 1 } },
             { :io_wait               => { 'units' => '%', 'precision' => 1, 'label' => 'IO Wait' } },
             { :steal                 => { 'units' => '%', 'precision' => 1 } },
             { :interrupts            => { 'units' => '/sec', 'precision' => 1 } },
             { :procs_running         => { 'units' => '', 'precision' => 0 } },
             { :procs_blocked         => { 'units' => '', 'precision' => 0 } },
             { :last_minute           => { 'units' => '', 'precision' => 2  } },
             { :last_five_minutes     => { 'units' => '', 'precision' => 2  } },
             { :last_fifteen_minutes  => { 'units' => '', 'precision' => 2 } } ]

  attr_reader :historical_metrics

  def initialize
    @collector = ServerMetrics::Cpu.new()
    @historical_metrics = Hash.new
  end

  def run
    res = @collector.run

    self.class.fields.each do |field|
      @historical_metrics[field.name] ||= RingBuffer.new(30)
      @historical_metrics[field.name].push(res[field.name])
    end

    res
  end

  def self.fields
    const_get(:FIELDS).map{|h| Scout::Realtime::Field.new(h) }
  end
end