unless IO.respond_to? :write
  require 'backports/tools'

  def IO.write(name, string, offset = nil, options = Backports::Undefined)
    Backports.write(false, name, string, offset, options)
  end
end
