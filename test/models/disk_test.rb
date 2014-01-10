require_relative '../test_helper'

class DiskTest < Minitest::Test
  def setup
    @disk = Scout::Realtime::Disk.new
  end

  def test_collector
    ServerMetrics::Disk.any_instance.expects(:run).returns({})
    @disk.run
  end

  def test_historical_metrics_collects_values
    ServerMetrics::Disk.any_instance.stubs(:run).returns({"/dev/sda6"=>{:size=>123}}, {"/dev/sda6"=>{:size=>234}})
    2.times { @disk.run }
    assert_equal [nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, 123, 234], @disk.historical_metrics["/dev/sda6"][:size]
  end

  def test_historical_metrics_add_keys_that_didnt_report
    ServerMetrics::Disk.any_instance.stubs(:run).returns({"/dev/sda6"=>{}})
    @disk.run
    assert_equal [nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil], @disk.historical_metrics["/dev/sda6"][:size]
  end
end
