require 'backports/tools'

Backports.make_block_optional ENV, :reject, :test_on => ENV
Backports.make_block_optional ENV, :reject!, :test_on => ENV
