# This is derek's vagrant file. Can delete if it causes confusion. It starts an Ubuntu Ruby 2 box.
Vagrant::Config.run do |config|
  config.vm.box = "Ubunutu64-ruby2"
  config.vm.box_url = "https://dl.dropboxusercontent.com/s/o5i10hcu57jamg8/ubuntu64-ruby2.box"
  config.vm.share_folder "foo", "/projects", "/Users/itsderek23/projects/"
  config.vm.forward_port 5555,5555
end
