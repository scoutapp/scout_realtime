require 'backports/tools'

Backports.make_block_optional Enumerable, :find_all, :test_on => 1..2
