require 'backports/tools'

Backports.alias_method IO, :ungetbyte, :ungetc
