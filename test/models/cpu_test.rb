require_relative '../test_helper'

class CpuTest < Minitest::Test
  def setup
    @cpu = Scout::Realtime::Cpu.new
  end

  def test_collector
    ServerMetrics::Cpu.any_instance.expects(:run).returns({})
    @cpu.run
  end

  def test_historical_metrics_collects_values
    ServerMetrics::Cpu.any_instance.stubs(:run).returns({:user => 123}, {:user => 234})
    2.times { @cpu.run }
    assert_equal [nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, 123, 234], @cpu.historical_metrics[:user]
  end

  def test_historical_metrics_add_keys_that_didnt_report
    ServerMetrics::Cpu.any_instance.stubs(:run).returns({})
    @cpu.run
    assert_equal [nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil], @cpu.historical_metrics[:user]
  end
end
