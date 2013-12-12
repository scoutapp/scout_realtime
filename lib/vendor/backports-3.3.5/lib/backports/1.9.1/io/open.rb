begin
  File.open(__FILE__) { |f| IO.open(f.fileno, :mode => 'r').close }
rescue TypeError
  require 'backports/tools'

  class << IO
    def open_with_options_hash(*args)
      if args.size > 2 || args[1].respond_to?(:to_hash)
        fd, mode, options = (args << Backports::Undefined)
        args = [fd, Backports.combine_mode_and_option(mode, options)]
      end
      if block_given?
        open_without_options_hash(*args){|f| yield f}
      else
        open_without_options_hash(*args)
      end
    end

    Backports.alias_method_chain self, :open, :options_hash
  end
end
