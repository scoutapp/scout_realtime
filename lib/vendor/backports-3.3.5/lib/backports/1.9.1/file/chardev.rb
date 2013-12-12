if RUBY_VERSION < '1.9'
  require 'backports/tools'

  Backports.convert_first_argument_to_path File, :chardev?
end
