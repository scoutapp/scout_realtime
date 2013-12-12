require "backports/tools"
require "backports/extra/random/MT19937"
require "backports/extra/random/bits_and_bytes"
require "backports/extra/random/implementation"

class Random
  include Implementation
  class << self
    include Implementation
  end

  def inspect
    "#<#{self.class.name}:#{object_id}>"
  end

  srand
end
