require 'backports/tools'

Backports.make_block_optional String, :each_line, :test_on => "abc"

Backports.alias_method String, :lines, :each_line
