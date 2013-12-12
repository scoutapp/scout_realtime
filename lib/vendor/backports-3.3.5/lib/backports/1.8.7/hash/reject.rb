require 'backports/tools'

Backports.make_block_optional Hash, :reject, :reject!, :test_on => {:hello => "world!"}
