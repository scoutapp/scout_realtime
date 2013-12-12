unless String.respond_to? :try_convert
  require 'backports/tools'

  def String.try_convert(x)
    Backports.try_convert(x, String, :to_str)
  end
end
