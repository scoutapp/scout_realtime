require 'backports/tools'

Backports.make_block_optional String, :each, :test_on => "abc" if "is there still an each?".respond_to? :each
