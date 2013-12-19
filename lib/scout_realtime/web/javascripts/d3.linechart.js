function lineChart(params) {
  this.data = params.data;
  this.parent = params.parent;
  var element = params.element;
	var line, path, x, y;
	
  this.draw = function() {
	  selection = d3.select(element);
    // get the width and height form the selection
    var width = selection.node().clientWidth || parseInt($(selection.node()).css('width'));
    var height = selection.node().clientHeight || parseInt($(selection.node()).css('height'));
    y = d3.scale.linear().range([height, 0]);
    x = d3.time.scale().range([0, width]);
		now = new Date();
    x.domain([new Date(now - 1*60*1000), now]); // 1 minute
  	y.domain([yMin(this.data),yMax(this.data)])
		
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
	
		 path = selection.append("g")
		.attr("clip-path", "url(#clip)")
		  .append("path")
		    .datum(data)
		    .attr("class", "line")
		    .attr("d", line)
  } // this.draw

	this.refresh = function() {
		var now = new Date();
		// update domains
		x.domain([now - 1*60*1000, now.getTime()]); // 1 minute duration
  	y.domain([yMin(this.data),yMax(this.data)]);
	  path
			// update the line - this isn't part of the transition. new points will be off to the right.
			.attr("d", line)
      .attr("transform", null)	
			// slide the path to the left 1 second
			.transition()
					.duration(tv-50) // duration is the same as the update interval...if it equals the update interval, it gets canceled?
      		.ease("linear")
					.attr("transform", "translate(" + x(x.domain()[0]-tv) + ")")
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