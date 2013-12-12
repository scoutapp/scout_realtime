require 'backports/tools'

class << ARGF
  Backports.alias_method self, :readbyte, :readchar
end
