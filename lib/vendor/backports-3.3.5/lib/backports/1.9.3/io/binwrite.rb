unless IO.respond_to? :binwrite
  require 'backports/tools'

  def IO.binwrite(name, string, offset = nil, options = Backports::Undefined)
    Backports.write(true, name, string, offset, options)
  end
end
