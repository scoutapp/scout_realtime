require "scout_realtime/version"

$LOAD_PATH << File.join(File.dirname(__FILE__))

# only for development - load the server_metrics project code instead of the gem
$LOAD_PATH.unshift File.join(File.dirname(__FILE__), "/../../rails/server_metrics/lib")

# load sinatra, etc in vendor instead of from gems. Just remove this (and add depedencies in gemspec) to use gems instead
vendor_path=File.expand_path(File.join(File.dirname(__FILE__),"vendor"))
Dir.entries(vendor_path).each do |vendor|
  full_path = File.join(vendor_path, vendor, "lib")
  $LOAD_PATH.unshift(full_path) if File.directory?(full_path)
end

require 'rubygems'
require 'webrick'
require 'erb'
require 'logger'
require 'json'
require 'server_metrics'

require 'scout_realtime/runner'
require 'scout_realtime/web_app' # sinatra version # require 'scout_realtime/web_server'# embedded webrick version
require 'scout_realtime/main'
require File.join(File.dirname(__FILE__),"/../test/data_for_testing")

module Scout
  module Realtime
    @@logger=nil

    def self.logger;
      @@logger;
    end

    def self.logger=(l)
      @@logger=(l);
    end
  end
end

