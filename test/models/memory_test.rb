require_relative '../test_helper'

class MemoryTest < Minitest::Test
  def setup
    @memory = Scout::Realtime::Memory.new
  end

  def test_collector
    ServerMetrics::Memory.any_instance.expects(:run).returns({})
    @memory.run
  end

  def test_historical_metrics_collects_values
    ServerMetrics::Memory.any_instance.stubs(:run).returns({:size => 123}, {:size => 234})
    2.times { @memory.run }
    assert_equal [nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, 123, 234], @memory.historical_metrics[:size]
  end

  def test_historical_metrics_add_keys_that_didnt_report
    ServerMetrics::Memory.any_instance.stubs(:run).returns({})
    @memory.run
    assert_equal [nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil], @memory.historical_metrics[:size]
  end
end
