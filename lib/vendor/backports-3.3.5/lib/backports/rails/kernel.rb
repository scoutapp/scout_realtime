class Object
  # Standard in rails. See official documentation[http://api.rubyonrails.org/classes/Object.html]
  def try(method_id, *args, &block)
    send(method_id, *args, &block) unless self.nil?
  end unless method_defined? :try
end
