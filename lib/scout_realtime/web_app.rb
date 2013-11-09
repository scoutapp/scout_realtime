require 'sinatra'
require 'sinatra/reloader' if ENV["RACK_ENV"].to_s == "development"
require 'ostruct'

class Scout::Realtime::WebApp < Sinatra::Base

  set :port, 5555
  set :static, true                             # set up static file routing
  set :public_dir, File.expand_path('../web', __FILE__) # set up the static dir (with images/js/css inside)
  set :views,  File.expand_path('../web/views', __FILE__) # set up the views dir
  set :environment, ENV["RACK_ENV"] && ENV["RACK_ENV"] != '' ? ENV["RACK_ENV"] : :production

  configure :development do
    register Sinatra::Reloader
  end

  get '/' do
    latest_run = Scout::Realtime::Main.instance.collector.latest_run
    @disks = (latest_run[:disks] ||{}).keys.sort
    @network = (latest_run[:network] ||{}).keys.sort
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
    Scout::Realtime::Main.instance.collector.latest_run.to_json
  end

  get '/d3' do
    erb :d3, :layout => false
  end

  get '/handlebars' do
    erb :handlebars
  end

end

