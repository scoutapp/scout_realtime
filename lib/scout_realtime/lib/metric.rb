class Scout::Realtime::Metric
  attr_accessor :historical_metrics

  def initialize
    @historical_metrics = Hash.new
  end

  def run
    collector_response = @collector.run
    aggregate(collector_response)
    collector_response
  end

  def self.metadata
    meta = self::FIELDS
    meta.keys.each_with_object(meta) do |field_name, formatted_meta|
      formatted_meta[field_name]['label'] ||= field_name.to_s.capitalize.gsub('_', ' ')
      formatted_meta[field_name]['units'] ||= ''
      formatted_meta[field_name]['precision'] ||= 1 
    end
  end
end
