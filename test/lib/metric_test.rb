require_relative '../test_helper'

class MetricTest < Minitest::Test
  def setup
    @metric = MetricExample.new
  end

  def test_metadata
    assert_equal({ 'units' => '%', 'precision' => 1, 'label' => 'tester' }, MetricExample.metadata[:test_field])
  end

  def test_metadata_creates_missing_labels
    assert_equal 'Empty field', MetricExample.metadata[:empty_field]['label']
  end

  def test_metadata_defaults_units_to_blank_string
    assert_equal '', MetricExample.metadata[:empty_field]['units']
  end

  def test_metadata_defaults_precision_to_one
    assert_equal 1, MetricExample.metadata[:empty_field]['precision']
  end

  def test_rescues_noent_exceptions
    # these errors bubble up from Sys::ProcTable occasionally. Timing issues? Could be investigated further.
    collector_stub = stub
    collector_stub.stubs(:run).raises(Errno::ENOENT)
    @metric.instance_variable_set(:@collector, collector_stub)
    @metric.stubs(:aggregate) # not interested in aggregating
    assert_equal({}, @metric.run)
  end
end

class MetricExample < Scout::Realtime::Metric
  FIELDS = { :test_field => { 'units' => '%', 'precision' => 1, 'label' => 'tester' },
             :empty_field => {}
           }
end
