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

    def protected!
        return if !basic_auth_enabled?
        return if authorized?
        headers['WWW-Authenticate'] = 'Basic realm="Resctricted Area"'
        halt 401, "Not Authorized\n"
    end

    def basic_auth_enabled?
        return Scout::Realtime::Main.instance.auth_object["basic_auth_enabled"]
    end

    def authorized?
        @auth ||= Rack::Auth::Basic::Request.new(request.env)
        username = Scout::Realtime::Main.instance.auth_object["username"]
        password = Scout::Realtime::Main.instance.auth_object["password"]
        @auth.provided? and @auth.basic? and @auth.credentials and @auth.credentials == [username, password]
    end
  end

  get '/' do
      protected!
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
      protected!
      Scout::Realtime::Main.instance.start_thread
      redirect "/"
  end

  get '/stop' do
      protected!
      Scout::Realtime::Main.instance.stop_thread!
      redirect "/"
  end

  get '/stats.json' do
      protected!
      content_type :json
      Scout::Realtime::Main.instance.runner.latest_run.to_json
  end
end
