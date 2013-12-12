require 'backports/tools'

class << ObjectSpace
  Backports.make_block_optional self, :each_object, :test_on => ObjectSpace
end
