require "bundler/gem_tasks"


# put the current packaged version of the gem in dropbox
desc "copies the current packaged .gem file to dropbox and prints the URL"
task :dropbox do

  path=File.dirname(__FILE__)+"/pkg/scout_realtime-#{Scout::Realtime::VERSION}.gem"
  if !File.exists?(path)
    puts "Doesn't exist: #{path}. Try rake build"
    exit(0)
  end

  FileUtils.copy(path, "/Users/andre/Dropbox/Public/")
  puts "wget https://dl.dropboxusercontent.com/u/18554/scout_realtime-#{Scout::Realtime::VERSION}.gem; sudo gem install scout_realtime"
end
