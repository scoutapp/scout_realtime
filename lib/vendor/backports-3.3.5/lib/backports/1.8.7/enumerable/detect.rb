require 'backports/tools'

Backports.make_block_optional Enumerable, :detect, :test_on => 1..2
