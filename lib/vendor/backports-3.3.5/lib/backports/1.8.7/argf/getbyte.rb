require 'backports/tools'

class << ARGF
  Backports.alias_method self, :getbyte, :getc
end
