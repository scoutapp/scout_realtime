class Scout::Realtime::Metric
  attr_accessor :historical_metrics
  attr_reader :latest_run

  def initialize
    @historical_metrics = Hash.new
  end

  def run!
    begin
      @latest_run = @collector.run
    rescue Errno::ENOENT => e
      print "#############################################################################"
      puts "#{e.class}: #{e.message}"
      @latest_run = {}
    end
    update_historical_metrics(latest_run)
  end

  def self.metadata
    meta = self::FIELDS
    meta.keys.each_with_object(meta) do |field_name, formatted_meta|
      formatted_meta[field_name]['label'] ||= field_name.to_s.capitalize.gsub('_', ' ')
      formatted_meta[field_name]['units'] ||= ''
      formatted_meta[field_name]['precision'] ||= 1 
    end
  end

  def self.short_name
    self.to_s.split('::').last.downcase.to_sym
  end

  def self.descendants
    [Scout::Realtime::Memory, Scout::Realtime::Cpu, Scout::Realtime::Disk, Scout::Realtime::Network, Scout::Realtime::Processes]
  end
end
