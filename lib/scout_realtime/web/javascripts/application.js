
var tv = 1000;
palette = new Rickshaw.Color.Palette({ scheme: 'spectrum14' });


// CPU

// instantiate our graph
var graph = new Rickshaw.Graph({
        element: $("#cpu_chart_container .old-chart").get(0),
        width: 800,
        height: 50,
        renderer: 'stack',
        series: new Rickshaw.Series.FixedDuration([
        { name: 'last minute' },
        { name: 'last five minutes' },
        { name: 'last fifteen minutes' }
], palette, {
        timeInterval: tv,
        maxDataPoints: 100,
        timeBase: new Date().getTime() / 1000
        })
});

var y_ticks = new Rickshaw.Graph.Axis.Y({
        graph: graph,
        orientation: 'left',
        tickFormat: Rickshaw.Fixtures.Number.formattedYValue,
        element: $("#cpu_chart_container .y_axis").get(0)
        });

var hoverDetail = new Rickshaw.Graph.HoverDetail({
        graph: graph
        });

var legend = new Rickshaw.Graph.Legend({
        graph: graph,
        element: $("#cpu_chart_container .chart_legend").get(0)
        });

graph.render();

// -----------------------------------------------------------------------------------------------------
// Memory

// instantiate our graph
var mem_graph = new Rickshaw.Graph({
        element: $("#memory_chart_container .old-chart").get(0),
        width: 800,
        height: 50,
        renderer: 'stack',
        series: new Rickshaw.Series.FixedDuration([
        { name: 'used percent' },
      { name: 'swap percent' }
], palette, {
        timeInterval: tv,
        maxDataPoints: 100,
        timeBase: new Date().getTime() / 1000
        })
});

var y_ticks = new Rickshaw.Graph.Axis.Y({
        graph: mem_graph,
        orientation: 'left',
        tickFormat: Rickshaw.Fixtures.Number.formattedYValue,
        element: $("#memory_chart_container .y_axis").get(0)
        });

var hoverDetail = new Rickshaw.Graph.HoverDetail({
        graph: mem_graph
        });

var legend = new Rickshaw.Graph.Legend({
        graph: mem_graph,
        element: $("#memory_chart_container .chart_legend").get(0)
        });

mem_graph.render();

// add some data every so often
var currentMetricIndex = 0;
var tick = function () {
        var metrics = metrics_array[currentMetricIndex];
        currentMetricIndex = currentMetricIndex < metrics_array.length - 1 ? currentMetricIndex + 1 : 0;

        graph.series.addData({"last minute": metrics.cpu.last_minute, 'last five minutes': metrics.cpu.last_five_minutes, 'last fifteen minutes': metrics.cpu.last_fifteen_minutes});
mem_graph.series.addData({"used percent": metrics.memory.used_percent, 'swap percent': metrics.memory.swap_percent});


graph.render();
mem_graph.render();

}

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

tick();
toggleData();
