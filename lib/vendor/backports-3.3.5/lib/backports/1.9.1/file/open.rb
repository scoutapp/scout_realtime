begin
  File.open(__FILE__, :mode => 'r'){}
rescue TypeError
  require 'backports/tools'

  def open_with_options_hash(file, mode = nil, perm = Backports::Undefined, options = Backports::Undefined)
    mode, perm = Backports.combine_mode_perm_and_option(mode, perm, options)
    perm ||= 0666 # Avoid error on Rubinius, see issue #52
    if block_given?
      open_without_options_hash(file, mode, perm){|f| yield f}
    else
      open_without_options_hash(file, mode, perm)
    end
  end

  Backports.alias_method_chain File, :open, :options_hash
end

if RUBY_VERSION < '1.9'
  require 'backports/tools'

  Backports.convert_first_argument_to_path File, :open
end
