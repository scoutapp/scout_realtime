require 'backports/tools'

Backports.alias_method Proc, :yield, :call
