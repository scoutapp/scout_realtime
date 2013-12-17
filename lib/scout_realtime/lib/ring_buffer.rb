class RingBuffer < Array

  alias_method :array_push, :push
  alias_method :array_element, :[]

  def initialize( size )
    @ring_size = size
    super( size )
  end

  def push( element )
    if length == @ring_size
      shift # loose element
    end
    array_push element
  end

  # Access elements in the RingBuffer
  #
  # offset will be typically negative!
  #
  def []( offset = 0 )
    return self.array_element( - 1 + offset )
  end
end
