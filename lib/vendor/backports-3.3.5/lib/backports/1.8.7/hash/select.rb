require 'backports/tools'

Backports.make_block_optional Hash, :select, :test_on => {:hello => "world!"}
