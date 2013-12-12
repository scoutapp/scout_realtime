require 'backports/tools'

Backports.make_block_optional IO, :each, :force => true if RUBY_VERSION < '1.8.7'
