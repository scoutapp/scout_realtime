require 'backports/tools'

Backports.make_block_optional Enumerable, :find, :test_on => 1..2
