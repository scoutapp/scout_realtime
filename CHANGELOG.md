## 1.0.4

* Added hostname to title
* Single play/pause button
* Added --bind option to bind to a specific IP Address on the host
* Updating server_metrics dependency to 1.2.4

## 1.0.3

* switch to relatives paths in templates, so it will work in an nginx subfolder.
* Updating server_metrics dependency to 1.2.3

## 1.0.2

* Updated copyright
* Removed typekit - included on mistake and fonts weren't used.
* Updating server_metrics dependency to 1.2.2

## 1.0.1

* Updating server_metrics dependency to 1.2.1 for OSX :avail memory fix

## 1.0.0

* Release!

## 0.5.5

* Using the `server_metrics` Collector `TTL` option for better performance on system calls.
* Set runner interval to 3 seconds
* Using CPU `:skip_load => true` option as load average info is not displayed. Collecting this involves a system call.

## 0.5.4

* Misc UI updates

## 0.5.3

* Update executable output - instructions for accessing from your browser.

## 0.5.2

* Updating authors and gemspec metadata.

## 0.5.1

* Fixed Firefox layout, added some UI refinements, bumped up server_metrics gem requirement.

## 0.5.0

* Initial beta release.
