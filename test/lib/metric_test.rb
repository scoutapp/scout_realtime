require_relative '../test_helper'

class MetricTest < Minitest::Test
  def setup
    @metric = Scout::Realtime::MetricExample.new
    @collector_stub = stub(:run => { :metric => :value })
    @metric.instance_variable_set(:@collector, @collector_stub)
    @metric.stubs(:update_historical_metrics) # do nothing unless specifically being tested
  end

  def test_saves_latest_run
    @metric.run!
    assert_equal({ :metric => :value }, @metric.latest_run)
  end

  def test_metadata
    assert_equal({ 'units' => '%', 'precision' => 1, 'label' => 'tester' }, Scout::Realtime::MetricExample.metadata[:test_field])
  end

  def test_metadata_creates_missing_labels
    assert_equal 'Empty field', Scout::Realtime::MetricExample.metadata[:empty_field]['label']
  end

  def test_metadata_defaults_units_to_blank_string
    assert_equal '', Scout::Realtime::MetricExample.metadata[:empty_field]['units']
  end

  def test_metadata_defaults_precision_to_one
    assert_equal 1, Scout::Realtime::MetricExample.metadata[:empty_field]['precision']
  end

  def test_rescues_noent_exceptions
    # these errors bubble up from Sys::ProcTable occasionally. Timing issues? Could be investigated further.
    @collector_stub.stubs(:run).raises(Errno::ENOENT)
    @metric.run!
    assert_equal({}, @metric.latest_run)
  end

  def test_determines_short_name
    assert_equal 'metricexample', Scout::Realtime::MetricExample.short_name
  end
end

class Scout::Realtime::MetricExample < Scout::Realtime::Metric
  FIELDS = { :test_field => { 'units' => '%', 'precision' => 1, 'label' => 'tester' },
             :empty_field => {}
           }
end
