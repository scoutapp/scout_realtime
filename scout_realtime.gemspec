# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'scout_realtime/version'

Gem::Specification.new do |spec|
  spec.name          = "scout_realtime"
  spec.version       = Scout::Realtime::VERSION
  spec.authors       = ["Andre Lewis", "Derek Haynes", "Matt Rose"]
  spec.email         = ["support@scoutapp.com"]
  spec.description   = "Realtime server metrics in your browser."
  spec.summary       = ""
  spec.homepage      = "http://scoutapp.github.io/scout_realtime/"
  spec.license       = "MIT"

  spec.files         = `git ls-files`.split($/)
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler", "~> 1.3"
  spec.add_development_dependency "rake"
  spec.add_development_dependency "minitest-reporters"
  spec.add_development_dependency "awesome_print"
  spec.add_development_dependency "mocha"
  spec.add_development_dependency "pry"

  # Runtime dependencies
  spec.add_runtime_dependency "server_metrics", "~> 1.2.1"
end
