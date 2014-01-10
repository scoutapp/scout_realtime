module Scout::Realtime::Aggregator
  def aggregate(collector_response)
    self.class::FIELDS.keys.each do |field_name|
      historical_metrics[field_name] ||= RingBuffer.new(60)
      historical_metrics[field_name].push(collector_response[field_name])
    end
  end
end
