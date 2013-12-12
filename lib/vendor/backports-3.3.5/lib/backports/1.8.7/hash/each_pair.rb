require 'backports/tools'

Backports.make_block_optional Hash, :each_pair, :test_on => {:hello => "world!"}
