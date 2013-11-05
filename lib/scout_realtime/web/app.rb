require 'sinatra'
require "sinatra/reloader" if development?

class Scout::Realtime::Webapp < Sinatra::Base

  configure :development do
    register Sinatra::Reloader
  end

  set :port, 5555
  set :static, true                             # set up static file routing
  set :public_dir, File.expand_path('../web_root', __FILE__) # set up the static dir (with images/js/css inside)

  set :views,  File.expand_path('../web_root/views', __FILE__) # set up the views dir

  # Your "actions" go here…
  #
  get '/' do
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

end

