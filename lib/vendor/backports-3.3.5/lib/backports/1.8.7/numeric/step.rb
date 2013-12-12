require 'backports/tools'

Backports.make_block_optional Numeric, :step, :test_on => 42, :arg => [100, 6]
