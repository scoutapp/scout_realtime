if RUBY_VERSION < '1.8.7'
  require 'backports/tools'

  class << IO
    Backports.make_block_optional self, :foreach, :force => true
  end
end
