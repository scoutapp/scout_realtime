require 'backports/tools'

Backports.make_block_optional Enumerable, :partition, :test_on => 1..2
