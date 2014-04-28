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
  set :bind, self.bind || "0.0.0.0" # 0.0.0.0 is the default and is required for Vagrant
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
    runner = Scout::Realtime::Main.instance.runner
    @latest_run = runner.latest_run
    @historical_metrics = runner.historical_metrics
    @disks = (@latest_run[:disk] ||{}).keys.sort
    @networks = (@latest_run[:network] ||{}).keys.sort
    @processes = (@latest_run[:processes] ||{}).map { |k, v| OpenStruct.new(v) }.sort_by { |a| a.memory }.reverse
    @meta = %w(cpu memory disk network processes).each_with_object({}) do |realtime_class, meta|
      meta[realtime_class] = Scout::Realtime.const_get(realtime_class.capitalize).metadata
    end

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
end
