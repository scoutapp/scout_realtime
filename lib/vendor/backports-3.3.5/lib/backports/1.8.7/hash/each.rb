require 'backports/tools'

Backports.make_block_optional Hash, :each, :test_on => {:hello => "world!"}
