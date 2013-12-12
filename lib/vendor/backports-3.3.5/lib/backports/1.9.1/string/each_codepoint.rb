require 'backports/tools'

Backports.alias_method String, :each_codepoint, :codepoints
