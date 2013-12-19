var ChartsView = {
  init: function(params) {
    var _this = this;
    this.active = false;
    this.charts = [];
    $.each(params, function(name, value) {
      _this[name] = value;
    });
  },

  pollForUpdates: function() {
    var _this = this;
    var timeOffset = 0;
    this.poller = setInterval(function() {
      _this.update(timeOffset++);
    }, _this.pollInterval);
  },

  update: function (timeOffset) {
    var _this = this;
    $.getJSON(_this.url + '?time_offset=' + timeOffset,function (data) {
      _this.updateData(data);
      if (_this.active) {
        _this.updateCharts();
      }
    }).fail(function () {
      console.log("error fetching data");
    });
  },

  setActive: function() {
    this.active = true;
    this.updateCharts();
  },
};

var Chart = {
  init: function(params) {
    var _this = this;
    $.each(params, function(name, value) {
      _this[name] = value;
    });
  },

  renderData: function() {
    this.barChart.data = this.data;
    if (this.data.length) { this.barChart.draw() };
  },

  updatedLatestValue: function() {
    this.$latestValue.html(this.formattedValue(this.latestValue));
  },

	/* 
	 * For the displays where the latest value is positioned above the chart, the latest value need to be aligned 
	 * with the last rectangle in the chart svg element. This is because the rectangles may not use the full width of the svg
	 * to avoid aliased lines.
	 */
	positionLatestValue: function() {
		if (this.latestValuePositioned) {return true} // only need to position once
		$lastRect = $(this.chartSVG).children('g').last();
		// Workaround - FF doesn't return SVG position() relative to the parent but to the entire viewport. 
		left = $lastRect.get(0).getBoundingClientRect().right - $(this.chartSVG).get(0).getBoundingClientRect().left;
		margin = this.$container.width()-left;
		this.$latestValue.css("margin-right",margin);
		if ($chartSub = this.$container.children(".chart_sub")) {
			$chartSub.css("margin-right",margin);
		}
		this.latestValuePositioned = true;
	},

  formattedValue: function(value, meta_index) {
    meta_index = typeof meta_index !== 'undefined' ? meta_index : 0; // default to first set of meta values
    // numberToHumanSize?
    /*
    if(this.units && (this.units.indexOf("KB") !== -1 || this.units.indexOf("MB") !== -1)) {
      var numString;
      if(this.units.indexOf("KB") !== -1) {
        numString = numberToHumanSize(this.latestValue * 1024);
      } else if(this.units.indexOf("MB") !== -1) {
        numString = numberToHumanSize(this.latestValue * 1024 * 1024);
      }
      this.latestValue = numString.split(" ")[0];
      this.units = this.units.replace("KB", numString.split(" ")[1]);
    }
    */
    var formattedUnits;
    var currentMeta;
    if(this.meta[meta_index] == null) {
      currentMeta = {};
    } else {
      currentMeta = this.meta[meta_index];
    }
    if(typeof currentMeta.units == 'undefined') {
      formattedUnits = '';
    } else if(currentMeta.units == '%') {
      formattedUnits = currentMeta.units;
    } else {
      formattedUnits = ' ' + currentMeta.units;
    }
    return numberFormatter(value, currentMeta.precision, currentMeta.delimiter) + formattedUnits;
  },

  labelOrBlank: function(meta_index) {
    if(this.meta[meta_index] == null) {
      return '';
    } else {
      return this.meta[meta_index].label + ': ';
    }
  }
};

// based on https://github.com/jblz/Javascript-Number-Formatter/blob/master/numberFormatter.js

function numberFormatter ( num, places, ksep, dsep ) {
  var sign = '';
  if(num < 0) { sign = '-'; }
  num = Math.abs(num);
  var rounder = function( n, places ) {
    n2 = parseFloat(n);
    if( isNaN(n2) ) return n;
    places = parseInt(places);
    if( isNaN(places) ) places = 0;
    var factor= Math.pow(10,places);
    return Math.floor(n*factor+((n*factor*10)%10>=5?1:0))/factor;
  };
  var num = rounder( num, places );
  if ( isNaN( num ) ) return num;
  if ( 'undefined' == typeof places ) places = 0;
  if ( 'undefined' == typeof ksep ) ksep = ',';
  if ( 'undefined' == typeof dsep ) dsep = '.';
  num = num.toString();
  if ( places > 0 ) {
    var dot = num.indexOf( '.' );
    var rlength = num.substr( dot ).length - 1;
    if ( -1 == dot ) {
      num = num + '.';
      for ( var i = 0; i < places; i++ ) {
        num = num + '0';
      }
    }
    else if ( places > rlength ) {
      var diff = places - rlength;
      for ( var i = 0; i < diff; i++ ) {
        num = num + '0';
      }
    }
  }

  var l = '', m = '', r = '';
  num.replace( /^([0-9]*)?(\.)?([0-9]*)?$/, function( $0, $1, $2, $3 ) {
    var llen = $1.length;
    if ( llen > 3 ) {
      for ( var i = llen - 1; i >= 0; i-- ) {
        var x = i - llen + 1;
        if ( x != 0 && x % 3 == 0 ) l = ksep + l;
        l = $1[i] + l;
      }
    }
    else {
      l = $1;
    }
    if ( $2 == '.' && ! isNaN( $3 ) ) {
      m = dsep;
      r = $3;
    }
  });
  return sign + l + m + r;
}

function formatTime(timestamp) {
  var date = new Date(timestamp);
  var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var month = monthNames[date.getMonth()];
  var hour = date.getHours();
  var ampm;
  if(hour > 12) {
    hour = hour - 12;
    ampm = 'pm';
  } else {
    ampm = 'am';
  }
	// only print date if not today
	dateString = ''
	if (date.toDateString() != new Date().toDateString()) {
		dateString += month + ' ' + date.getDate() + ', ';
	}
  return dateString  + hour + ':' + (date.getMinutes()<10?'0':'') + date.getMinutes() + ampm;
}