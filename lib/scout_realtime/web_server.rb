require "pathname"

module Scout::Realtime
  class WebServer < WEBrick::HTTPServlet::AbstractServlet
    WEB_ROOT=File.expand_path(File.join(File.dirname(__FILE__),"/../../web_root"))
    def do_GET req, res
      Dir.chdir(WEB_ROOT)
      web_root_files=Dir.glob("**/*")
      path=req.path

      res.status = 200
      res['Content-Type'] = 'text/plain'
      res.body = "sorry :)"

      if path=="/"
        template = ERB.new(File.read(File.join(WEB_ROOT, 'root.html.erb')))
        res['Content-Type'] = 'text/html'
        res.body =template.result(binding)
      elsif path=="/stop"
        Scout::Realtime::Main.instance.stop_thread!
        res.set_redirect WEBrick::HTTPStatus::TemporaryRedirect, "/"
      elsif path=="/start"
        Scout::Realtime::Main.instance.start_thread
        res.set_redirect WEBrick::HTTPStatus::TemporaryRedirect, "/"
      elsif path=="/stats.json"
        res.body=Scout::Realtime::Main.instance.collector.latest_run.to_json
        res['Content-Type'] = 'application/json'
      elsif web_root_files.include?(path.gsub(/^\//,''))
        res.body=File.read(File.join(WEB_ROOT,path))
        res['Content-Type'] = WEBrick::HTTPUtils.mime_type(path,WEBrick::HTTPUtils::DefaultMimeTypes)
      end
    end
  end
end
