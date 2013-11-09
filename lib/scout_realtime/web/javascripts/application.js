var tv = 1000;
palette = new Rickshaw.Color.Palette({ scheme: 'spectrum14' });

var chartDefs = {
    /* CPU */
    "cpu_load": {
        "metrics": ["last_minute", "last_five_minutes", "last_fifteen_minutes"]
    },
    "cpu_io_wait": {
        "metrics": ["io_wait"]
    },
    "cpu_business": {
        "metrics": ["system", "idle", "user"]
    },
    /* Disk */
    "disks_utilization": {
        "metrics": ["utilization"]
    },

    "disks_read_write": {
        "metrics": ["rps", "wps"]
    },
    "disks_read_write_kbs": {
        "metrics": ["rps_kb", "wps_kb"]
    },
    /* Network */
    "network_bytes": {
        "metrics": ["bytes_in", "bytes_out"]
    },
    "network_packets": {
        "metrics": ["packets_in", "packets_out"]
    },
    /* Memory  */
    "memory_swap_used_percent": {
        "metrics": ["swap_used_percent"]
    },
    "memory": {
        "metrics": ["size", "used"]
    }
};


var iv = null;
function toggleData() {
    if (iv) {
        clearInterval(iv);
        iv = null;
        $("#toggle_data").removeClass("on");
    } else {
        iv = setInterval(tick, tv);
        $("#toggle_data").addClass("on")
    }
}


var graphs = {};
var metrics = {};

$(function () {
  $(".chart").each(function (i) {
    var $chart = $(this);
    var chartType = $chart.data("type");
    var chartInstanceName = $chart.data("instance-name");
    var id = chartType + chartInstanceName;
    var names = chartDefs[chartType]['metrics'];
    hash = $.map(names, function (e, i) {
      return({name: e})
    });

    console.log("got a chart of type " + chartType);

    var graph = new Rickshaw.Graph({
      element: this,
      renderer: 'stack',
      series: new Rickshaw.Series.FixedDuration(hash,
          palette, {
            timeInterval: tv,
            maxDataPoints: 100,
            timeBase: new Date().getTime() / 1000
          })
    });

    var yTicks = new Rickshaw.Graph.Axis.Y({
      graph: graph
    });
    yTicks.render();

    var hoverDetail = new Rickshaw.Graph.HoverDetail({
      graph: graph
    });

    var legend = new Rickshaw.Graph.Legend({
      graph: graph,
      element: $chart.parent().find(".chart_legend").get(0)
    });

    graphs[id] = graph;
    graph.render();
  });

  tick();
  toggleData();
});

var currentMetricIndex = 0;
function tick() {
//    var metrics = metrics_array[currentMetricIndex];
//    currentMetricIndex = currentMetricIndex < metrics_array.length - 1 ? currentMetricIndex + 1 : 0;

  $(".chart").each(function (i) {
    var $chart = $(this);
    var chartType = $chart.data("type");
    var chartInstanceName = $chart.data("instance-name");
    var id = chartType + chartInstanceName;
    var names = chartDefs[chartType]['metrics'];
    var metricKey = chartType.split("_")[0]

    //console.debug("for metricKey['"+metricKey+"'] is type "+ typeof(metrics[metricKey]))

    var graph = graphs[id];
    if (typeof(metrics[metricKey]) == "object") {
      dataSource = chartInstanceName == '' ? metrics[metricKey] : metrics[metricKey][chartInstanceName];
      hash = {};
      for (var i = 0; i < names.length; i++) {
        n = names[i];
        hash[n] = dataSource[n];
      }
      graph.series.addData(hash);
      graph.render();
    }
    refresh();
  });
}


function refresh() {
  $.getJSON("/stats.json", function (d) {
    // console.debug(metrics)
    metrics = d;
  });
}
