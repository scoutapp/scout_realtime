var tv = 1000;
palette = new Rickshaw.Color.Palette({ scheme: 'munin' });
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
var metrics = {};

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

$(function () {
  $("#sort_cpu, #sort_memory").change(function(){Processes.sortBy=this.value; d("sort by "+this.value)})
  Processes.init({element:document.getElementById('processes')})
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
  //setTimeout(tick,1000)

});

function tick() {
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
  });

  Processes.update(metrics['processes']);
  refresh();
}

var currentMetricIndex = 0;
function refresh() {
  $.getJSON("/stats.json", function (d) {
    metrics = d;
  });
//  metrics = metrics_array[currentMetricIndex];
//  currentMetricIndex = currentMetricIndex < metrics_array.length - 1 ? currentMetricIndex + 1 : 0;
}

