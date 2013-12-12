unless IO.respond_to? :try_convert
  require 'backports/tools'

  def IO.try_convert(obj)
    Backports.try_convert(obj, IO, :to_io)
  end
end
