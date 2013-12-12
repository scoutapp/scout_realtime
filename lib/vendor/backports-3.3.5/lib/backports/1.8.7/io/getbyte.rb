require 'backports/tools'

Backports.alias_method IO, :getbyte, :getc
