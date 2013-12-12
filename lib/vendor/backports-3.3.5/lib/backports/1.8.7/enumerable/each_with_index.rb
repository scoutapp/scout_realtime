require 'backports/tools'

Backports.make_block_optional Enumerable, :each_with_index, :test_on => 1..2
