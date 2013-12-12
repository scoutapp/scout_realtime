require 'backports/tools'

Backports.make_block_optional Hash, :each_key, :test_on => {:hello => "world!"}
