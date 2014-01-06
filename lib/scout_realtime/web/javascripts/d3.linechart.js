function lineChart(params) {
  this.data = params.data;
  this.parent = params.parent;
  this.yScaleMax = params.yScaleMax;
  this.element = params.element;
	var line, path, x, y, barWidth, height, selection, chartInfo, latestValue, latestProcessValue;
	
  this.draw = function() {
	  selection = d3.select(this.element);
    // get the width and height form the selection
    var width = selection.node().clientWidth || parseInt($(selection.node()).css('width'));
    height = selection.node().clientHeight || parseInt($(selection.node()).css('height'));
    y = d3.scale.linear().range([height, 0]);
    x = d3.time.scale().range([0, width]);
		now = new Date();
    x.domain([new Date(now - 60 * tv), now]);
    var currentYMax = d3.max([this.yScaleMax, yMax(this.data)]);
    if(this.yScaleMax) {
      var currentYMin = d3.min([0,yMin(this.data)]);
    } else {
      var currentYMin = yMin(this.data);
    }
  	y.domain([currentYMin, currentYMax])
		
		// used to handle clipping, but not sure how it works (or if it is doing anything)
		selection.append("defs").append("clipPath")
		    .attr("id", "clip")
		  .append("rect")
		    .attr("width", width-5) // new data points are drawn outside of clip area
		    .attr("height", height);

    line = d3.svg.line()
		    .interpolate("basis")
		    .x(function(d, i) { return x(d.time); })
		    .y(function(d, i) { return y(d.value[0]); });
	
    barWidth = width / this.data.length;

    chartInfo = $(selection[0]).parent().siblings('.chart_info');
    latestValue = $(selection[0]).parent().siblings('.latest_value');
    latestProcessValue = $(selection[0]).siblings('.latest_value');
    latestValue.html(this.data[this.data.length - 1].value[0]);

    chartSection = selection.selectAll("rect")
        .data(this.data);

    chartSection.enter()
        .append("rect")
        .attr("class", "chart_section")
        .attr("width", barWidth)
        .attr("height", height)
        .attr("transform", function(d, i) { return "translate(" + (x(d.time) - barWidth) + ",0)"; })
        .on("mouseover", function(d) {
          latestValue.html(d.value[0]);
          latestProcessValue.html(d.value[0]);
          chartInfo.html(d.tooltip);
        })
        .on("mouseout", function(d) {
          chartInfo.html("");
        });

		path = selection.append("g")
        .attr("clip-path", "url(#clip)")
		  .append("path")
		    .datum(this.data)
		    .attr("class", "line")
		    .attr("d", line);
  } // this.draw

	this.refresh = function() {
		var now = new Date();
		// update domains
		x.domain([new Date(now - 60 * tv), now.getTime()]);
    var currentYMax = d3.max([this.yScaleMax, yMax(this.data)]);
    if(this.yScaleMax > 0) {
      var currentYMin = d3.min([0,yMin(this.data)]);
    } else {
      var currentYMin = yMin(this.data);
    }
  	y.domain([currentYMin, currentYMax]);

    latestValue.html(this.data[this.data.length - 1].value[0]);

	  path
			// update the line - this isn't part of the transition. new points will be off to the right.
			.attr("d", line)
      .attr("transform", null)	
			// slide the path to the left 1 second
			.transition()
					.duration(tv-50) // duration is the same as the update interval...if it equals the update interval, it gets canceled?
      		.ease("linear")
					.attr("transform", "translate(" + x(x.domain()[0]-tv) + ")");

    chartSection = selection.selectAll("rect")
        .data(this.data);

    chartSection.enter()
        .append("rect")
        .attr("class", "chart_section")
        .attr("width", barWidth)
        .attr("height", height)
        .attr("transform", function(d, i) { return "translate(" + (x(d.time) - barWidth) + ",0)"; })
        .on("mouseover", function(d) {
          chartInfo.html(d.tooltip);
        })
        .on("mouseout", function(d) {
          chartInfo.html("");
        })
      .transition()
        .duration(1)
        .attr("transform", function(d, i) { return "translate(" + (x(d.time) - barWidth) + ",0)"; })

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
  
  return this;
}
