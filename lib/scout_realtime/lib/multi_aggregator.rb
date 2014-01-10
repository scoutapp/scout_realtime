module Scout::Realtime::MultiAggregator
  def update_historical_metrics(collector_response)
    # since this is a multi-collector, the first level of the result hash is name
    collector_response.each_pair do |name,metrics_hash|
      historical_metrics[name] ||= {}
      self.class::FIELDS.keys.each do |field_name|
        historical_metrics[name][field_name] ||= RingBuffer.new(60)
        historical_metrics[name][field_name].push(metrics_hash[field_name])
      end
    end
  end
end
