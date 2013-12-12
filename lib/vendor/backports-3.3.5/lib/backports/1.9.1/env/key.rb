require 'backports/tools'

class << ENV
  Backports.alias_method self, :key, :index
end
