# Scout Realtime

Stream realtime server and process metrics to your browser!

<a href="http://scoutapp.github.io/scout_realtime/"><img src="https://dl.dropboxusercontent.com/u/468982/blog/realtime_screen.png"></a>



## To get started:

* On the server you want to monitor:
  * install the gem: `gem install scout_realtime`
  * start the daemon: `scout_realtime start`
* On your local computer:
  * create an SSH tunnel to your server: `ssh -NL 5555:localhost:5555 user@ip_or_hostname` (where user@ip_or_hostname is the same as you usually use to SSH to your server)
  * Point your browser to http://localhost:5555

When you're done, you can stop the daemon with: `scout_realtime stop`

## Why?

Scout realtime is a better `top` command: it gives you disk, memory, network, CPU, and process metrics. And it gives you smooth-flowing charts for everything. **Troubleshooting is so much easier when you can see a few minutes worth of realtime data** instead of watching individual numbers flash on your terminal window.   


## Questions & troubleshooting

* **Something isn't working. Where's the log?** By default, the a log is written to `~/scout_realtime.log`
* **Does my server need to have a public IP or domain name?** Yes, you need a public IP or domain name to view Scout Realtime in your browser.
* **Installing the gem didn't work.** You need Ruby 1.8.7+ on your server to run Scout Realtime. Try `which ruby` (to confirm you have Ruby), `ruby -v` (to show Ruby's version), and `which gem` to confirm you have Ruby gems (Ruby's package manager) available.
* **Can multiple people view the realtime stats?** Yes. You'll probably want to open a port in your firewall instead of relying in the SSH tunnel for access: `sudo iptables -A INPUT -p tcp --dport 5555 -j ACCEPT`
* **The SSH tunnel is a pain. Is there a way to set up persistent access?** Yes -- open a port in your firewall using the iptables command above.
  * **Is that safe?** It's as safe or safer than any any other service you have listening for HTTP traffic. The realtime web server only serves two endpoints, and there's nothing available at either of those endpoints that can be used in an attack.
* **5555 is a strange number. Can I run it on a different port?** Yes. `scout_realtime --help` for options.
* **I want to log written someplace other than my home directory.** You can do that. See `scout_realtime --help` for options.
* **How much resources will this take if I leave it running?** About the same CPU resources as htop. A bit more memory because it's written in Ruby.


Learn more at [scoutapp.github.io/scout_realtime](http://scoutapp.github.io/scout_realtime/).


