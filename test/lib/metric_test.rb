require_relative '../test_helper'

class MetricTest < Minitest::Test
  def setup
    @metric = MetricExample
  end

  def test_metadata
    assert_equal({ 'units' => '%', 'precision' => 1, 'label' => 'tester' }, @metric.metadata[:test_field])
  end

  def test_metadata_creates_missing_labels
    assert_equal 'Empty field', @metric.metadata[:empty_field]['label']
  end

  def test_metadata_defaults_units_to_blank_string
    assert_equal '', @metric.metadata[:empty_field]['units']
  end

  def test_metadata_defaults_precision_to_one
    assert_equal 1, @metric.metadata[:empty_field]['precision']
  end
end

class MetricExample < Scout::Realtime::Metric
  FIELDS = { :test_field => { 'units' => '%', 'precision' => 1, 'label' => 'tester' },
             :empty_field => {}
           }
end
