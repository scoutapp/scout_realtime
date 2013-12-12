require 'backports/tools'

Backports.alias_method IO, :readbyte, :readchar
