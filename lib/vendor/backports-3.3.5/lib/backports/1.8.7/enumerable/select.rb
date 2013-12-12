require 'backports/tools'

Backports.make_block_optional Enumerable, :select, :test_on => 1..2
