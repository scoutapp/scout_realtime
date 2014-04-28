var refreshInterval = 1000;
var processIteration = 0;
var firstShift = true;
var overviewChartMargin = 30; // pulled from lineChart overview margin
function d(s){console.debug(s)}

window.refresher = null;
function toggleData() {
	// Pause button is displayed on page load when streaming. 
	// Play button is shown when streaming is paused.
  if (window.refresher) { 
		// streaming => pause
    clearInterval(window.refresher);
    window.refresher = null;
    $("#toggle #play").show()//addClass("disabled");
    $("#toggle #pause").hide()//removeClass("disabled");
  } else {
		// pause => streaming
    window.refresher = setInterval(refresh, refreshInterval);
    $("#toggle #play").hide()//;removeClass("disabled");
    $("#toggle #pause").show()//;addClass("disabled");
  }
}

var graphs = {};

var Processes={
  index:{}, // processName: {count:chart, cpu:chart, memory:chart, row:jQueryObject}
  element:null, // passed on init
  tableBody:null, // jQuery object, saved here for fast access
  tableRowTemplate:null, // a handlebars template - is compiled on init
  sortBy:"memory",

  init:function(opts){
    Processes.options = $.merge({},opts)
    Processes.element=opts.element
    Processes.tableBody=$(Processes.element).find("tbody");
    Processes.tableRowTemplate = Handlebars.compile($("#process-template").html());

    // process sorting
    $('#processes th[data-sort-by="memory"] .sort-down').show();
    $(Processes.element).find("th").hover().click(function(e){
      $this=$(this);
      $(Processes.element).find('.sort-down, .sort-up').hide();
      $this.find('.sort-down').show();
      Processes.setSort($this.data('sort-by'));
      e.stopPropagation();
    })
  },

  update:function(raw_processes){
    var values = Object.keys(raw_processes).map(function (key) { return raw_processes[key]; });
    values.sort(function(a, b) { return b[Processes.sortBy] - a[Processes.sortBy] });
    values = values.slice(0, 10);
    var processes = {}
    $.each(values, function(index, value) {
      processes[value.cmd] = value;
    });
    if(processIteration % 10 == 0) {
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
    }

    // 3. add data and update charts
    for(cmd in Processes.index) {
      data = metrics['processes'][cmd];

      row = Processes.index[cmd].row;
      $.each(['count', 'cpu', 'memory'], function(index, metric) {
        var graph = Processes.index[cmd][metric];
        if(graph && data) {
          graph.data.push({time: new Date().getTime(), value: [data[metric]]});
          graph.data.shift();
        }
      });

      if(data) {
        Processes.index[cmd]['row'].data({'memory':data['memory'],'cpu':data['cpu'],'count':data['count']}); // raw numbers for sorting
      }
    }

    if(processIteration % 10 == 0) {
      // 4. reorder table rows as needed
      rows = Processes.tableBody.children('tr').get();
      rows.sort(function(a, b) {
        var compA = $(a).data(Processes.sortBy);
        var compB = $(b).data(Processes.sortBy);
        return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
      })
      $.each(rows, function(idx, itm) {
        Processes.tableBody.prepend(itm);
      });
    }
    processIteration++;
  },
  add:function(process){
    Processes.index[cmd]={};
    html=Processes.tableRowTemplate(process);
    $row = $(html).appendTo(Processes.tableBody);
    var chart;
    $row.find(".chart").each(function(i){
      var $chart=$(this);
      $chart.width($chart.parent().width()); // set the width - necessary for firefox
      var metric = $chart.data("type");
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
      chart = new lineChart({ element: $(this).get(0), data: data, metadata: meta.processes[metric], type: 'process' });
      chart.draw();
      Processes.index[cmd][metric] = chart;
    });
    Processes.index[cmd]['row'] = $row;
  },
  remove:function(cmd){
    Processes.index[cmd]['row'].remove();
    delete Processes.index[cmd];
  },
  setSort:function(sortBy){
    if (sortBy != Processes.sortBy) {
      Processes.sortBy = sortBy;
      processIteration = 0;
      Processes.update(metrics['processes']);
    }
  }
}

/* --------------------------------------- */

$(document).ready(init);

function init() {
  Processes.init({element:document.getElementById('processes')});
	setOverviewChartWidths();

	$(window).on("debouncedresize", function( event ) {
		setOverviewChartWidths();
	});

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
      chart = new lineChart({ element: $chart.get(0), data: data, yScaleMax: yScaleMax, metadata: (chartMetrics.length > 1 ? meta[collector] : meta[collector][chartMetrics[0]]), type: 'overview' });
      chart.draw();
      graphs[id] = chart;
    } else {
      console.log('No data reported for ' + collector);
    }
  });

  $('#toggle .button').on('click', function() {
    toggleData();
  });

  updateGraphData(); // uncomment to get an initial render
  toggleData(); // uncomment to get continuous data
  // setTimeout(updateGraphData, 1000) // uncomment to get ONE update in a second (for development)
  // normally, lines 1 and 2 above will be uncommented

	// in chrome, the initial chart size is larger than what the parent container is. calling it here resets things.
	// still need to call it before drawing charts as FF won't draw it full width.
	setOverviewChartWidths()

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
      if(firstShift) {
        // only don't shift off the data on the first iteration. leave it a tail so the graph does not clip along choppily
        firstShift = false;
      } else {
        graph.data.shift();
      }
    }
  });

  $('#report-time').html(formatTime(new Date));
  $('#memory-used').html(parseInt(metrics.memory.used));
  $('#memory-size').html(parseInt(metrics.memory.size));
  $('#disk-used').html(parseInt(metrics.disk[Object.keys(metrics.disk)[0]].used));
  $('#disk-size').html(parseInt(metrics.disk[Object.keys(metrics.disk)[0]].size));
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
  $.getJSON("stats.json", function (d) {
    metrics = d;
    updateGraphData();
  }).fail(function() {
    toggleData();
    $('#fail_message').show();
  });
}

/*
Called on initial load. Just sets the svg element to the size of its parent. This is needed on firefox.

Why don't we just use % widths for containers?

The chart SVGs have a 30px left margin to handle the y-axis. We need to shift the charts over 30px to the left
to handle this. We also need to add 30px to the width of the chart so it ends up using the entire container width
after the 30px left shift.

 */
function setOverviewChartWidths(){
	$overview_charts_td = $('#overview_charts');
	totalWidth = $overview_charts_td.width(); // width of the td container for the 4 overview charts
	padding = parseInt($overview_charts_td.css('padding-left'));
	containerWidth = (totalWidth-2*padding-5)/2; // why -5? chrome overlaps at -4, ff at -5. don't know why.
	$('.overview_chart_container').each(function(i,e) {
		$(e).width(containerWidth).css('margin-right',padding)
	});

  $('.overview_chart').each(function(i,e){
    $svg=$(e);
    $svg.width(containerWidth+overviewChartMargin);
  });
}
