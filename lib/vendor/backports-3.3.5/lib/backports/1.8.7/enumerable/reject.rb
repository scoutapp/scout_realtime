require 'backports/tools'

Backports.make_block_optional Enumerable, :reject, :test_on => 1..2
