/* new BarChart({ element: this.chartSVG, data: this.data, yMax: this.yMax, addColors: this.colors, parent: this })
 */
function BarChart(params) {
  this.data = params.data;
  this.parent = params.parent;
  var element = params.element;
	var colors = ["#65A7DE"]; // default color is light blue
  var currentYMax = params.yMax;
  var numberOfBars = this.data.length; 
	if(params.addColors) {
    colors = colors.concat(params.addColors);
  }
  var color = d3.scale.ordinal()
    .range(colors)
    .domain([0, (this.data.length ? this.data[0].value.length-1 : 0)])

  var selection, width, height, rangeWidth, barWidth, y, x, yWithMinimum, heightWithMinimum, tooltip;

  this.setYMax = function(yMax) {
    currentYMax = yMax;
  }

  function setViewDependentVariables() {
    selection = d3.select(element);
    // get the width and height form the selection
    width = selection.node().clientWidth || parseInt($(selection.node()).css('width'));
    height = selection.node().clientHeight || parseInt($(selection.node()).css('height'));

    // want the same width for each bar. with anti-aliasing enabled, the widths will be integers but aren't
    // guarenteed to be the same width. this uses the greatest possible width of the svg element where the bars
    // will all be the same width.
    rangeWidth = Math.floor(width / numberOfBars)*numberOfBars;
    barWidth = (rangeWidth / numberOfBars) - 1;

    y = d3.scale.linear().range([height, 0]);
    x = d3.time.scale().rangeRound([0, rangeWidth]);

    // y and height are modified to always show the first series even if it isn't large enough
    // to be displayed. this ensures a dashed line is always displayed vs. missing blocks.
    yWithMinimum = function(d, i) {
      var yValue = y(d.y1); 
      if (i==0 && (y(d.y0) - y(d.y1)) < 1 && y(0) == height) {
        yValue = height - 1.5; // height of the container - 1px (height we're using as minimum) - 0.5 (anti-aliasing)
      }
      return yValue;
    }

    heightWithMinimum = function(d, i) {
      var height = Math.abs(y(d.y0) - y(d.y1));
      if (i==0) {
        height = d3.max( [height,1] );
      }
      return height;
    }

    if($('#charts-tooltip').length > 0) {
      tooltip = d3.select('#charts-tooltip');
    } else {
      tooltip = d3.select('body').append('div')
        .attr('id', 'charts-tooltip')
        .attr('class', 'modal-tooltip')
        .style('opacity', 0);
    }
  }

  /* passing in anything other than false will make the charts update without a sliding effect.
     Pass in false (or nothing at all), and the bars will slide left for the new data. */
  this.draw = function(suppressAnimation) {
    if(!selection) { setViewDependentVariables(); } // only call the first time we draw
    var animationDuration = suppressAnimation ? 0 : 1000;
    var data = this.data;
    var _this = this;
    var stackedData = data.map(function(d){
      y0 = 0;
      formattedTime = formatTime(d.time);
      return { value: d.value.map(
        function(d) {
          if(d >= 0) {
            thisY0 = y0;
            thisY1 = y0 += d;
            //return { d: d, time: formattedTime, y0: y0, y1: y0 += d }
          } else {
            thisY1 = y0;
            thisY0 = y0 += d;
            //return { d: d, time: formattedTime, y0: y0 += d, y1: y0 - d }
          }
          return { d: d, time: formattedTime, y0: thisY0, y1: thisY1 }
        }
      ), time: d.time };
    })

    // time update
    var timeMin = d3.min(data.map(function(d) {return d.time}));
    // adds the step to the timeMax. otherwise, the last data element is drawn on 100% of the x scale.
    // want the last data element to fully fit in the svg element.
    var timeMax = d3.max(data.map(function(d) {return d.time})) + step(data); // add a minute to the max
    x.domain([timeMin, timeMax]);
    y.domain([yMin(data), yMax(data)]);
    var state = selection.selectAll(".g")
      .data(stackedData, function(d) { return d.time; });
    // initialise entering bars and then do the transition
    var stateEnter = state
      .enter().append("g")
        .attr("class", "g")
        .attr("transform", function(d) { return "translate(" + x(d.time + enterStep(state)) + ",0)"; })

    stateEnter.selectAll("rect")
        .data(function(d) { return d.value; })
      .enter().append("rect")
        .attr("width", barWidth)
        .attr("y", function(d,i) { return yWithMinimum(d, i); })
        .attr("height", function(d,i) { return heightWithMinimum(d, i); })
        .attr("class", "bar")
        .style("fill", function(d,i) { return color(i); })
        .on("mouseover", function(d, i) {
          tooltip.transition()
            .duration(200)
            .style('opacity', 1)
          tooltip.html(tooltipHTML(_this,d,i))
            .style("left", (d3.event.pageX) + 20 + "px")
            .style("top", (d3.event.pageY) + "px");
        })
        .on("mouseout", function(d) {
          tooltip.transition()
            .duration(200)
            .style('opacity', 0);
        });

      
    // transition entering and updating bars
    state.transition()
      .duration(animationDuration)
      .attr("transform", function(d) { return "translate(" + x(d.time) + ",0)"; })
      .attr('width', barWidth);

    // rescale height to new data
    state.selectAll('rect').transition()
      .duration(animationDuration)
      .attr("y", function(d,i) { return yWithMinimum(d, i); })
      .attr("height", function(d,i) { return heightWithMinimum(d, i); });
    
    // remove shifted bar that is not displayed anymore
    state.exit()
      .transition()
        .duration(animationDuration)
        .attr("transform", function(d) { return "translate(" + x(d.time) + ",0)"; })
      .remove();
  }

  function yMax(data) {
    dataMax = d3.max(data, function(d) {
      var total = 0;
      $.each(d.value, function(i, value) {
        total += value;
      });
      return total;
    });
    return d3.max([(currentYMax||0), dataMax]);
  }

  function yMin(data) {
    dataMin = d3.min(data, function(d) {
      var total = 0;
      $.each(d.value, function(i, value) {
        total += value;
      });
      return total;
    });
    return d3.min([0, dataMin]);
  }

	/* When new data are added via enter(), they are transitioned from the right to the left unless
	 * >= 6 new elements will be added. This is a bit of a hack to not apply a transition when the page is 
	 * initially loaded, but may actually look better when a refresh results in a lot more data 
	 * (shifting a lot of elements looks wrong). 
	 */
	function enterStep(state) {
		var val;
		// why 6? our highest interval is 5 minutes, so on initial, clients on this interval will show 30/5=6 bars.
		if (state.enter()[0].length >= 6) {
			val=0;
		} else {
			val=step(state.data());
		}
		return val;
	}
	
	// Returns the time interval interval btw data values in ms
	function step(data) {
		return data[1].time-data[0].time
	}
	
	/* Formats the text for the tooltips. Logic:
	 * If there is only one layer, don't print the label. Put time+value on same line. 
	 * If there is more than one layer, put time on first line, then label+value on the next line.
	 */
	function tooltipHTML(chart,d,i) {
		var tooltipHTML = ''
    if (chart.parent.meta.length > 1) {
      tooltipHTML = d.time + "<br/>";
      tooltipHTML += "<span class='label'>" + chart.parent.meta[i].label + "</span>";
    } else {
      tooltipHTML += "<span class='label'>" + d.time+ "</span>";
		}
    tooltipHTML += "<strong>"+chart.parent.formattedValue(d.d)+"</strong>";
		return tooltipHTML;
	}
  
  return this;
}