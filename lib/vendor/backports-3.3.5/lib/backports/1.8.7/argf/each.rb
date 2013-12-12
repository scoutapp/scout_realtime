require 'backports/tools'

Backports.make_block_optional ARGF, :each, :force => true if RUBY_VERSION < '1.8.7'
