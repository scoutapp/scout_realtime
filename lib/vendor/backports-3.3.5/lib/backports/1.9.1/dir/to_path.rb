require 'backports/tools'

Backports.alias_method Dir, :to_path, :path
