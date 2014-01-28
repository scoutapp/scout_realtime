function lineChart(params) {
  this.data = params.data;
  this.yScaleMax = params.yScaleMax;
  this.element = params.element;
  this.metadata = params.metadata;
	var line, path, x, y, barWidth, height, selection, chartInfo, latestValue, chartId;
	
  this.draw = function() {
    var _this = this;
	  selection = d3.select(this.element);
    chartId = $(selection[0]).data('collector') + $(selection[0]).data('instance-name');
    // get the width and height form the selection
    var width = selection.node().clientWidth || parseInt($(selection.node()).css('width'));
    height = selection.node().clientHeight || parseInt($(selection.node()).css('height'));
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
		    .attr("height", height);

    line = d3.svg.line()
		    .interpolate("basis")
		    .x(function(d, i) { return x(d.time); })
		    .y(function(d, i) { return y(d.value[0]); });
	

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
        .attr("transform", function(d, i) { return "translate(" + (x(d.time) - barWidth) + ",0)"; })
        .on("mouseover", function(d) {
          //latestValue.html(_this.format(d.value[0]));
          chartInfo.html(_this.tooltip(d)).show();
					latestValue.hide();
        })
        .on("mouseout", function(d) {
          chartInfo.html("").hide();
					latestValue.show();
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

      path
        // update the line - this isn't part of the transition. new points will be off to the right.
        .attr("d", line)
        .attr("transform", null)	
        // slide the path to the left 1 second
        .transition()
          .duration(refreshInterval - 50) // duration is the same as the update interval...if it equals the update interval, it gets canceled?
          .ease("linear")
          .attr("transform", "translate(" + x(x.domain()[0] - refreshInterval) + ")")
          .each("end", function() {
            _this.refresh();
          });

      chartSection = selection.selectAll("rect")
          .data(this.data);

      chartSection.enter()
          .append("rect")
          .attr("class", "chart_section")
          .attr("width", barWidth)
          .attr("height", height)
          .attr("transform", function(d, i) { return "translate(" + (x(d.time) - barWidth) + ",0)"; })
          .on("mouseover", function(d) {
            chartInfo.html(_this.tooltip(d));
          })
          .on("mouseout", function(d) {
            chartInfo.html("");
          })
        .transition()
          .duration(0)
          .attr("transform", function(d, i) { return "translate(" + (x(d.time) - barWidth) + ",0)"; })
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
    var formattedUnits = ( this.metadata.units == '%' ? '%' : '&nbsp;' + this.metadata.units )
    return(value.toFixed(this.metadata.precision) + formattedUnits);
  }

  this.tooltip = function(data) {
    var tooltipStr = '';
    if(data.valueBreakdown) {
      for(var key in data.valueBreakdown) {
        tooltipStr += key + ': ' + this.format(data.valueBreakdown[key]) + '; ';
      }
    } else {
      tooltipStr = this.format(data.value[0]);
    }
    return tooltipStr;
  }
  
  return this;
}
