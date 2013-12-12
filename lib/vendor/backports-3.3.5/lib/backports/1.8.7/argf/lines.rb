require 'backports/tools'

class << ARGF
  Backports.alias_method self, :lines, :each_line
end
