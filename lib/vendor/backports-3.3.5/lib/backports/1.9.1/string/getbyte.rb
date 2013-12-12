require 'backports/tools'

Backports.alias_method String, :getbyte, :[]
