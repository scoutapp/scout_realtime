require 'sinatra'
if ENV["RACK_ENV"].to_s == "development"
  require 'sinatra/reloader'
  require "sinatra/content_for"
end
require 'ostruct'

class Scout::Realtime::WebApp < Sinatra::Base

  set :environment, ENV["RACK_ENV"].to_s == "development" ? :development : :production
  set :static, true # set up static file routing
  set :public_dir, File.expand_path('../web', __FILE__) # set up the static dir (with images/js/css inside)
  set :views, File.expand_path('../web/views', __FILE__) # set up the views dir
  set :bind, "0.0.0.0" # necessary for running on vagrant
  #set :traps, false # setting this to false means 1) sinatra won't capture any interrupts or term signals; 2) we need to call Scout::Realtime::WebApp.quit! ourselves in our own signal trap

  #helpers Sinatra::ContentFor

  configure :development do
    puts "using Sinatra::Reloader for development"
    register Sinatra::Reloader
  end

  helpers do
    def precision(number, precision=0)
      "%.#{precision}f" % number
    end
  end


  get '/' do
    latest_run = Scout::Realtime::Main.instance.runner.latest_run
    @historical_metrics = Scout::Realtime::Main.instance.runner.historical_metrics
    @disks = (latest_run[:disks] ||{}).keys.sort
    @network = (latest_run[:network] ||{}).keys.sort
    @processes = (latest_run[:processes] ||{}).map { |k, v| OpenStruct.new(v) }.sort_by { |a| a.memory }.reverse

    #"ruby": {
    #    "cpu": 0.488400488400488,
    #    "cmd": "ruby",
    #    "cmdlines": [
    #    "ruby bin/scout_realtime"
    #],
    #    "count": 1,
    #    "memory": 2.6162109375
    #},

    erb :index
  end

  get '/start' do
    Scout::Realtime::Main.instance.start_thread
    redirect "/"
  end

  get '/stop' do
    Scout::Realtime::Main.instance.stop_thread!
    redirect "/"
  end

  get '/stats.json' do
    content_type :json
    Scout::Realtime::Main.instance.runner.latest_run.to_json
  end


  get '/d3' do
    erb :d3, :layout => false
  end

  get '/handlebars' do
    erb :handlebars
  end

end

