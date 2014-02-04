function lineChart(params) {
  this.data = params.data;
  this.yScaleMax = params.yScaleMax;
  this.element = params.element;
  this.metadata = params.metadata;
	// charts can plot multiple metrics. if so, we assume units are the same. fetch that data from the first metric.
	this.shared_metadata = ('units' in this.metadata ? this.metadata : this.metadata[Object.keys(this.metadata)[0]]);
	
	var line, path, x, y, barWidth, height, selection, chartInfo, latestValue, chartId, xAxis, yAxis;
  var type = params.type;
  if(type == 'overview') {
    var margin = { top: 20, right: 0, bottom: 20, left: 30 };
  } else {
    var margin = { top: 0, right: 0, bottom: 0, left: 0 };
  }
	
  this.draw = function() {
    var _this = this;
	  selection = d3.select(this.element);
    chartId = $(selection[0]).data('collector') + $(selection[0]).data('instance-name');
    // get the width and height form the selection
    var width = (selection.node().clientWidth || parseInt($(selection.node()).css('width'))) - margin.right; // don't take left margin into account for smoothness' sake
    height = (selection.node().clientHeight || parseInt($(selection.node()).css('height'))) - margin.bottom - margin.top;
    y = d3.scale.linear().range([height, 0]);
    x = d3.time.scale().range([0, width]);
		now = new Date();
    x.domain([new Date(now - 60 * refreshInterval), now]);
    var currentYMax = d3.max([this.yScaleMax, yMax(this.data)]);
    if(this.yScaleMax) {
      var currentYMin = d3.min([0,yMin(this.data)]);
    } else {
      var currentYMin = yMin(this.data);
    }
  	y.domain([currentYMin, currentYMax])
		
    barWidth = width / this.data.length;

		// used to handle clipping, but not sure how it works (or if it is doing anything)
		selection.append("defs").append("clipPath")
		    .attr("id", "clip-" + chartId)
        .attr("class", "clip-path")
		  .append("rect")
		    .attr("width", width - (barWidth * 2)) // new data points are drawn outside of clip area
		    .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    line = d3.svg.line()
		    .interpolate("basis")
		    .x(function(d, i) { return x(d.time); })
		    .y(function(d, i) { return y(d.value[0]); });
	

    if(type == 'overview') {
      xAxis = selection.append("g")
        .attr("class", 'x axis')
        .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
        .call(x.axis = d3.svg.axis().scale(x).ticks(d3.time.seconds, 15).tickFormat(d3.time.format("%I:%M:%S")).orient("bottom"));

      yAxis = selection.append("g")
        .attr("class", 'y axis')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(y.axis = d3.svg.axis().scale(y).ticks(1).orient("right"));
    }

    chartInfo = $(selection[0]).parent().siblings('.chart_info');
    latestValue = $(selection[0]).parent().siblings('.latest_value');
    latestValue.html(this.format(this.data[this.data.length - 1].value[0]));

    chartSection = selection.selectAll("rect")
        .data(this.data);

    chartSection.enter()
        .append("rect")
        .attr("class", "chart_section")
        .attr("width", barWidth)
        .attr("height", height)
        .attr("transform", function(d, i) { return "translate(" + ((x(d.time) - barWidth) + margin.left) + "," + margin.top + ")"; })
				// for overview charts, the latest value stays visible and the mouseover values appear beneath the chart. 
				// because of space constraints, the latest value is hidden in process charts and the mouseover value takes its place.
        .on("mouseover", function(d) {
          chartInfo.html(_this.tooltip(d))
					if (chartInfo.css('display') == 'none') {
						latestValue.hide();
						chartInfo.show();
					}
        })
        .on("mouseout", function(d) {
          chartInfo.html("")
					if (latestValue.css('display') == 'none') {
						latestValue.show();
						chartInfo.hide();
					}
        });

		path = selection.append("g")
        .attr("clip-path", "url(#clip-" + chartId + ")")
		  .append("path")
		    .datum(this.data)
		    .attr("class", "line")
		    .attr("d", line);

    this.refresh();
  } // this.draw

	this.refresh = function() {
    var _this = this;
    if(window.refresher) {
      var now = new Date();
      // update domains
      x.domain([new Date(now - 60 * refreshInterval), now.getTime()]);
      var currentYMax = d3.max([this.yScaleMax, yMax(this.data)]);
      if(this.yScaleMax > 0) {
        var currentYMin = d3.min([0,yMin(this.data)]);
      } else {
        var currentYMin = yMin(this.data);
      }
      y.domain([currentYMin, currentYMax]);

      latestValue.html(this.format(this.data[this.data.length - 1].value[0]));

      var translateTarget = x(x.domain()[0] - refreshInterval) + margin.left;

      path
        // update the line - this isn't part of the transition. new points will be off to the right.
        .attr("d", line)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        // slide the path to the left 1 second
        .transition()
          .duration(refreshInterval - 50) // duration is the same as the update interval...if it equals the update interval, it gets canceled?
          .ease("linear")
          .attr("transform", "translate(" + translateTarget + "," + margin.top + ")")
          .each("end", function() {
            _this.refresh();
          });

      if(type == 'overview') {
        xAxis.transition()
          .duration(refreshInterval - 50)
          .ease("linear")
          .call(x.axis);

        yAxis.transition()
          .call(y.axis);
      }

      chartSection = selection.selectAll("rect")
          .data(this.data);

      chartSection.enter()
          .append("rect")
          .attr("class", "chart_section")
          .attr("width", barWidth)
          .attr("height", height)
          .attr("transform", function(d, i) { return "translate(" + ((x(d.time) - barWidth) + margin.left) + "," + margin.top + ")"; })
          .on("mouseover", function(d) {
            chartInfo.html(_this.tooltip(d));
          })
          .on("mouseout", function(d) {
            chartInfo.html("");
          })
        .transition()
          .duration(0)
          .attr("transform", function(d, i) { return "translate(" + ((x(d.time) - barWidth) + margin.left) + "," + margin.top + ")"; })
    } else {
      setTimeout(function() { _this.refresh() }, refreshInterval);
    }
	}
	
	/* Given an array of data, iterates through and returns the maximum value. */
	function yMax(data) {
    dataMax = d3.max(data, function(d) {
      var total = 0;
      $.each(d.value, function(i, value) {
        total += value;
      });
      return total;
    });
    return dataMax;
  }

	/* Given an array of data, iterates through and returns the minimum value. */
	function yMin(data) {
    dataMin = d3.min(data, function(d) {
      var total = 0;
      $.each(d.value, function(i, value) {
        total += value;
      });
      return total;
    });
    return dataMin;
  }

  this.format = function(value) {
    var formattedUnits = ( this.shared_metadata.units == '%' ? '%' : '&nbsp;' + this.shared_metadata.units )
    return(value.toFixed(this.shared_metadata.precision) + formattedUnits);
  }

  this.tooltip = function(data) {
    var tooltipStr = '';
		// if multiple values (ex: io wait, system, user), display the metric label + value. otherwise,
		// just display the value.
    if(data.valueBreakdown && Object.keys(data.valueBreakdown).length > 1) {
      for(var key in data.valueBreakdown) {
				var label = ('units' in this.metadata ? this.metadata.label : this.metadata[key].label);
				if (!label) { label = key };
				// metrics aren't guarenteed to have a label. use it if they do.
        tooltipStr += '<span>'+label + '&nbsp;' + this.format(data.valueBreakdown[key]) + '</span>';
      }
    } else {
      tooltipStr = '<span>'+this.format(data.value[0])+'</span>';
    }
    return tooltipStr;
  }
  
  return this;
}
