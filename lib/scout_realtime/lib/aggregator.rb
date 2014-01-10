module Scout::Realtime::Aggregator
  def update_historical_metrics(collector_response)
    self.class::FIELDS.keys.each do |field_name|
      historical_metrics[field_name] ||= RingBuffer.new(60)
      historical_metrics[field_name].push(collector_response[field_name])
    end
  end
end
