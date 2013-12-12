if RUBY_VERSION < '1.9' && File.respond_to?(:lchmod)
  require 'backports/tools'

  Backports.convert_all_arguments_to_path File, :lchmod, 1
end
