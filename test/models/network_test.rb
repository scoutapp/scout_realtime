require_relative '../test_helper'

class NetworkTest < Minitest::Test
  def setup
    @network = Scout::Realtime::Network.new
  end

  def test_collector
    ServerMetrics::Network.any_instance.expects(:run).returns({})
    @network.run
  end

  def test_historical_metrics_collects_values
    ServerMetrics::Network.any_instance.stubs(:run).returns({"eth0"=>{:bytes_in=>123}}, {"eth0"=>{:bytes_in=>234}})
    2.times { @network.run }
    assert_equal [nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, 123, 234], @network.historical_metrics["eth0"][:bytes_in]
  end

  def test_historical_metrics_add_keys_that_didnt_report
    ServerMetrics::Network.any_instance.stubs(:run).returns({"eth0"=>{}})
    @network.run
    assert_equal [nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil], @network.historical_metrics["eth0"][:bytes_in]
  end
end
