require_relative 'test_helper'

class RunnerTest < Minitest::Test
  def setup
    @runner = Scout::Realtime::Runner.new
  end

  def test_run_runs_all_collectors
    Scout::Realtime::Metric.descendants.each do |collector|
      collector.any_instance.expects(:run!)
    end
    @runner.run
  end

  def test_returns_latest_run
    Scout::Realtime::Metric.descendants.each do |collector|
      collector.any_instance.stubs(:latest_run).returns({ :metric => :value })
    end
    assert_equal Scout::Realtime::Metric.descendants.map(&:short_name), @runner.latest_run.keys
    assert_equal([{ :metric => :value }], @runner.latest_run.values.uniq)
  end

  def test_returns_historical_metrics
    Scout::Realtime::Metric.descendants.each do |collector|
      collector.any_instance.stubs(:historical_metrics).returns({ :metric => :value })
    end
    assert_equal Scout::Realtime::Metric.descendants.map(&:short_name), @runner.historical_metrics.keys
    assert_equal([{ :metric => :value }], @runner.historical_metrics.values.uniq)
  end
end
