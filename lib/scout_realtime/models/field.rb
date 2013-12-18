class Scout::Realtime::Field

  attr_accessor :name, :label, :units, :precision

  # initialized a hash like:
  # { :bytes_in =>    { 'units' => 'KB/s', 'precision' => '0', 'label' => 'Bytes In' } }
  def initialize(hash)
    @name = hash.keys.first
    metadata = hash[@name]
    @label = metadata['label'] || @name.to_s.gsub('_', ' ') # poor man's humanize
    @units = metadata['units'] || ''
    @precision = metadata['precision'] || 0
  end

  # format the provided value
  def format(number)
    ("%.#{@precision}f" % number) + (@units == '%' ? '%' : " #{@units}")
  end
end