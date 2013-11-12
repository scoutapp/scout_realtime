var tv = 1000;
palette = new Rickshaw.Color.Palette({ scheme: 'munin' });

var chartDefs = {
    /* CPU */
    "cpu_load": {
      "metrics": [{"last_minute":"last minute"}, {"last_five_minutes":"last 5 minutes"}, {"last_fifteen_minutes":"last 15 minutes"}],
      "units": "",
      "precision": 2
    },
    "cpu_io_wait": {
      "metrics": [{"io_wait":"IO wait"}],
      "units": "",
      "precision": 2
    },
    "cpu_business": {
      "metrics": ["system", "idle", "user"],
      "units": "",
      "precision": 2
    },
    /* Disk */
    "disks_utilization": {
      "metrics": ["utilization"],
      "units": "",
      "precision": 2
    },

    "disks_read_write": {
      "metrics": [{"rps":"reads/sec"}, {"wps":"write/sec"}],
      "units": "/sec",
      "precision": 2
    },
    "disks_read_write_kbs": {
      "metrics": [{"rps_kb":"reads/sec KB"}, {"wps_kb":"writes/sec KB"}],
      "units": "KB/sec",
      "precision": 1
    },
    /* Network */
    "network_bytes": {
      "metrics": [{"bytes_in":"bytes in"}, {"bytes_out": "bytes out"}],
      "units": "Bytes/sec",
      "precision": 1
    },
    "network_packets": {
      "metrics": [{"packets_in":"packets in"}, {"packets_out":"packets out"}],
      "units": "",
      "precision": 2
    },
    /* Memory  */
    "memory_swap_used_percent": {
      "metrics": [{"swap_used_percent": "% swap used"}],
      "units":"%",
      "precision": 2
    },
    "memory": {
      "metrics": ["size", "used"],
      "units":"MB",
      "precision":0
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
      if (typeof(e) == 'string') {
        return({name: e})
      } else {
        return({name: e[Object.keys(e)[0]]})
      }
    });

    console.log("got a chart of type " + chartType);

    var graph = new Rickshaw.Graph({
      element: this,
      renderer: names.length == 1 ? 'bar' : 'line',
      series: new Rickshaw.Series.FixedDuration(hash,
          palette, {
            timeInterval: tv,
            maxDataPoints: 100,
            timeBase: new Date().getTime() / 1000
          })
    });
    var yTicks = new Rickshaw.Graph.Axis.Y({
      graph: graph,
      pixelsPerTick: 24,
      tickFormat:function(y){
        return(y+" "+chartDefs[chartType]['units'])
      }
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
        if(typeof(n) == "string") {
          hash[n] = dataSource[n];
        } else {
          k=Object.keys(n)[0];
          v=n[k]
          hash[v] = dataSource[k];
        }
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
