unless Array.method_defined? :sample
  require 'backports/tools'

  class Array
    def sample(n = Backports::Undefined)
      return self[Kernel.rand(size)] if n == Backports::Undefined
      n = Backports.coerce_to_int(n)
      raise ArgumentError, "negative array size" if n < 0
      n = size if n > size
      result = Array.new(self)
      n.times do |i|
        r = i + Kernel.rand(size - i)
        result[i], result[r] = result[r], result[i]
      end
      result[n..size] = []
      result
    end
  end
end
