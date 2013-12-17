class Scout::Realtime::MetricSource

  attr_reader :buffers

  def initialize
    # @buffers is hash of size-limited arrays: {:used => [1,2,3,4 ... 30]}
    @buffers = self.class.fields.reduce(Hash.new) do |hash, field|
      hash[field.name] = RingBuffer.new(30)
      hash
    end
  end

  def add_metrics(metrics)
    self.class.fields.each do |field|
      @buffers[field.name].push(metrics[field.name])
    end
  end

  def self.fields
    const_get(:FIELDS).map{|h| Scout::Realtime::Field.new(h) }
  end
end

