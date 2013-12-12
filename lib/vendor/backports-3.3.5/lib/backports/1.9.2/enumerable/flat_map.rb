unless Enumerable.method_defined? :flat_map
  require 'backports/1.8.7/array/flatten'

  module Enumerable
    def flat_map(&block)
      return to_enum(:flat_map) unless block_given?
      map(&block).flatten(1)
    end
    alias_method :collect_concat, :flat_map
  end
end
