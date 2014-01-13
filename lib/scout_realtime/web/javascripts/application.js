var refreshInterval = 1000;
function d(s){console.debug(s)}

window.refresher = null;
function toggleData() {
  if (window.refresher) {
    clearInterval(window.refresher);
    window.refresher = null;
    $("#toggle_data").removeClass("on");
  } else {
    window.refresher = setInterval(refresh, refreshInterval);
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

      row = Processes.index[cmd].row;
      $.each(['count', 'cpu', 'memory'], function(index, metric) {
        graph = Processes.index[cmd][metric];
        graph.data.push({time: new Date().getTime(), value: [data[metric]]});
        graph.data.shift();
      });

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
    Processes.index[cmd]={};
    html=Processes.tableRowTemplate(process);
    $row = $(html).appendTo(Processes.tableBody);
    var chart;
    $row.find(".chart").each(function(i){
      var metric = $(this).data("type");
      if(historical_metrics.processes[cmd]) {
        var bufferedData = historical_metrics.processes[cmd][metric];
      } else {
        var bufferedData = [];
        for (var i = 0; i < 61; i++) {
          bufferedData[i] = 0;
        }
      }
      // explicit times aren't passed, but these are required for the d3 x time scale.
      startTime = new Date()-(bufferedData.length*1000);
      // get the data into a proper format - [{time: ms since EPOCH, value: [array of values]}]
      data = [];

      $.each(bufferedData, function(data_index, value) {
        data.push({time: startTime + data_index * 1000, value: [value]})
      });

      chart = new lineChart({ element: $(this).get(0), data: data, metadata: meta.processes[metric] });
      chart.draw();
      Processes.index[cmd][metric] = chart;
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
  $("#sort_cpu, #sort_memory").change(function(){Processes.sortBy=this.value; d("sort by "+this.value)})
  Processes.init({element:document.getElementById('processes')})
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
      dataSource = historical_metrics[collector];
    }
    if(Object.keys(dataSource).length > 0) {
      var bufferedData = dataSource[chartMetrics[0]];
      // explicit times aren't passed, but these are required for the d3 x time scale.
      startTime = new Date()-(bufferedData.length*1000);
      // get the data into a proper format - [{time: ms since EPOCH, value: [array of values]}]
      data = [];

      $.each(bufferedData, function(data_index, value) {
        var valueBreakdown = {};
        var valueSum = 0;

        $.each(chartMetrics, function(metric_index, metric) {
          var metricValue = dataSource[metric][data_index] || 0;
          valueBreakdown[metric] = metricValue;
          valueSum += metricValue;
        });

        data.push({time: startTime + data_index * 1000, value: [valueSum], valueBreakdown: valueBreakdown})
      });

      chart = new lineChart({ element: $chart.get(0), data: data, yScaleMax: yScaleMax, metadata: meta[collector][chartMetrics[0]] });
      chart.draw();
      graphs[id] = chart;
    } else {
      console.log('No data reported for ' + collector);
    }
  });

  $('#toggle').on('click', function() {
    toggleData();
  });

  updateGraphData(); // uncomment to get an initial render
  toggleData(); // uncomment to get continuous data
  // setTimeout(updateGraphData, 1000) // uncomment to get ONE update in a second (for development)
  // normally, lines 1 and 2 above will be uncommented
}

function updateGraphData() {
  Processes.update(metrics['processes']);

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

      var valueBreakdown = {};
      var valueSum = 0;
      $.each(chartMetrics, function(metric_index, metric) {
        value = dataSource[metric] || 0;
        valueBreakdown[metric] = value;
        valueSum += value;
      });

      graph.data.push({time: new Date().getTime(), value: [valueSum], valueBreakdown: valueBreakdown});
      graph.data.shift();
    }
  });

  $('#report-time').html(formatTime(new Date));
  $('#memory-used').html(metrics.memory.used);
  $('#memory-available').html(metrics.memory.avail);
  $('#disk-used').html(metrics.disk[Object.keys(metrics.disk)[0]].used);
  $('#disk-available').html(metrics.disk[Object.keys(metrics.disk)[0]].avail);
}

function formatTime(timestamp) {
  var date = new Date(timestamp);
  var hour = date.getHours();
  var ampm;
  if(hour > 12) {
    hour = hour - 12;
    ampm = 'pm';
  } else {
    ampm = 'am';
 }
 dateString = ''
 return dateString  + hour + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ':' + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds() + ' ' + ampm;
}


function refresh() {
  $.getJSON("/stats.json", function (d) {
    metrics = d;
    updateGraphData();
  }).fail(function() {
    toggleData();
    $('#fail_message').show();
  });
}
