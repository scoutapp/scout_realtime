require_relative '../test_helper'

class ProcessesTest < Minitest::Test
  def setup
    @processes = Scout::Realtime::Processes.new
  end

  def test_collector
    ServerMetrics::Processes.any_instance.expects(:run).returns({})
    @processes.run
  end

  def test_historical_metrics_collects_values
    ServerMetrics::Processes.any_instance.stubs(:run).returns({"ruby"=>{:cpu=>123}}, {"ruby"=>{:cpu=>234}})
    2.times { @processes.run }
    assert_equal [nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, 123, 234], @processes.historical_metrics["ruby"][:cpu]
  end

  def test_historical_metrics_add_keys_that_didnt_report
    ServerMetrics::Processes.any_instance.stubs(:run).returns({"ruby"=>{}})
    @processes.run
    assert_equal [nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil], @processes.historical_metrics["ruby"][:cpu]
  end
end
