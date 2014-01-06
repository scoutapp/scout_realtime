var tv = 1000;
function d(s){console.debug(s)}

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

var Processes={
  index:{},
  element:null,
  tableBody:null,
  tableRowTemplate:null,
  sortBy:"memory",

  init:function(opts){
    Processes.options = $.merge({},opts)
    Processes.element=opts.element
    Processes.tableBody=$(Processes.element).find("tbody");
    d(Processes.tableBody)
    Processes.tableRowTemplate = Handlebars.compile($("#process-template").html());
    console.debug("Finished Processes.init")
  },
  update:function(processes){
    // 1. create any elements that are missing
    for(cmd in processes) {
      if(!Processes.index[cmd]) {
        Processes.add(processes[cmd]);
      }
    }

    // 2. delete any elements that are redundant
    for(cmd in Processes.index) {
      if(!processes[cmd]) {
        Processes.remove(cmd);
      }
    }

    // 3. add data and update charts
    for(cmd in Processes.index) {
      data = metrics['processes'][cmd];
      Processes.index[cmd]['count'].series.addData({'count':data['count']});
      Processes.index[cmd]['row'].find(".current_count").text(data['count'])
      Processes.index[cmd]['count'].render();
      Processes.index[cmd]['cpu'].series.addData({'cpu':data['cpu']});
      Processes.index[cmd]['row'].find(".current_cpu").text(data['cpu'].toFixed(2)+"%")
      Processes.index[cmd]['cpu'].render();
      Processes.index[cmd]['memory'].series.addData({'memory':data['memory']});
      Processes.index[cmd]['row'].find(".current_memory").text(data['memory'].toFixed(1)+" MB")
      Processes.index[cmd]['memory'].render();
      Processes.index[cmd]['row'].data({'memory':data['memory'],'cpu':data['cpu']}); // raw numbers for sorting
    }

    // TODO 3. reorder table rows as needed
    rows = Processes.tableBody.children('tr').get();
    rows.sort(function(a, b) {
      var compA = $(a).data(Processes.sortBy);
      var compB = $(b).data(Processes.sortBy);
      return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
    })
    $.each(rows, function(idx, itm) { Processes.tableBody.prepend(itm); });

  },
  add:function(process){
    console.debug("adding process: "+process.cmd);
    Processes.index[cmd]={};
    html=Processes.tableRowTemplate(process);
    $row=$(html).appendTo(Processes.tableBody);
    $row.find(".process_chart").each(function(i){
      var $chartDiv=$(this);
      var metric = $chartDiv.data("metric");
      var chart = new Rickshaw.Graph({
        element: this,
        renderer: 'bar',
        series: new Rickshaw.Series.FixedDuration([{color:"#E0F0F0", name:metric}],
            null, {
              timeInterval: tv,
              maxDataPoints: 30,
              timeBase: new Date().getTime() / 1000
            })
      });
      Processes.index[cmd][metric]=chart;
    });
    Processes.index[cmd]['row'] = $row;
  },
  remove:function(cmd){
    Processes.index[cmd]['row'].remove();
    delete Processes.index[cmd];
  }
}


/* --------------------------------------- */

$(document).ready(init);

function init() {
  // $("#sort_cpu, #sort_memory").change(function(){Processes.sortBy=this.value; d("sort by "+this.value)})
  // Processes.init({element:document.getElementById('processes')})
  $(".overview_chart").each(function (i) {
    var $chart = $(this);
    var collector = $chart.data("collector");
    var chartMetrics = $chart.data("metrics");
	  var chartInstanceName = $chart.data("instance-name");
    var yScaleMax = $chart.data('y_scale_max');
    var id = collector + chartInstanceName;
    var dataSource;

    if (chartInstanceName != '') {
      dataSource = historical_metrics[collector][chartInstanceName];
    } else {
      dataSource = historical_metrics[collector]
    }
    if(Object.keys(dataSource).length > 0) {
      var bufferedData = dataSource[chartMetrics[0]];
      // explicit times aren't passed, but these are required for the d3 x time scale.
      startTime = new Date()-(bufferedData.length*1000);
      // get the data into a proper format - [{time: ms since EPOCH, value: [array of values]}]
      data = [];

      $.each(bufferedData, function(data_index, value) {
        var tooltip = "";
        var valueSum = 0;

        $.each(chartMetrics, function(metric_index, metric) {
          var metricValue = dataSource[metric][data_index] || 0;
          tooltip += metric + ": " + metricValue + "; ";
          valueSum += metricValue;
        });

        data.push({time: startTime + data_index * 1000, value: [valueSum], tooltip: tooltip})
      });
      chart = new lineChart({ element: $chart.get(0), data: data, yScaleMax: yScaleMax });
      chart.draw();
      graphs[id] = chart;
    } else {
      console.log('No data reported for ' + collector);
    }
  });

  tick(); // uncomment to get an initial render
  toggleData(); // uncomment to get continuous data
  // setTimeout(tick,1000) // uncomment to get ONE update in a second (for development)
  // normally, lines 1 and 2 above will be uncommented
}

function tick() {
  $(".overview_chart").each(function (i) {
    var $chart = $(this);
    var collector = $chart.data("collector");
    var chartMetrics = $chart.data("metrics");
	  var chartInstanceName = $chart.data("instance-name");
    var id = collector + chartInstanceName;
    var graph = graphs[id];

    if(graph) { // if this metric did not initially report, it cannot be updated
      if (chartInstanceName != '') {
        dataSource = metrics[collector][chartInstanceName];
      } else {
        dataSource = metrics[collector]
      }

      var tooltip = "";
      var valueSum = 0;
      $.each(chartMetrics, function(metric_index, metric) {
        value = dataSource[metric] || 0;
        tooltip += metric + ': ' + value + "; ";
        valueSum += value;
      });

      // append to old data, refresh, remove oldest piece of data
      graph.data.push({time: new Date().getTime(), value: [valueSum], tooltip: tooltip});
      graph.refresh();
      graph.data.shift();
    }
  });

  //Processes.update(metrics['processes']);
  refresh();
}

var currentMetricIndex = 0;
function refresh() {
  $.getJSON("/stats.json", function (d) {
    metrics = d;
  })
    .fail(function() {
      toggleData();
      $('#fail_message').show();
    });
//  metrics = metrics_array[currentMetricIndex];
//  currentMetricIndex = currentMetricIndex < metrics_array.length - 1 ? currentMetricIndex + 1 : 0;
}
