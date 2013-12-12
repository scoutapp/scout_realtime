require 'backports/tools'

Backports.make_block_optional Hash, :each_value, :test_on => {:hello => "world!"}
