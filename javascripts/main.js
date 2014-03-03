// fake a simulated value
function simulate(value) {
	if (value < 1) {
		value = 10
	}
	range = 0.70; // % range, +- the value
	min = value*(1-range);
	max = value *(1+range);
	value=Math.floor(Math.random()*(max-min+1)+min);
	return value;
}

$(window).load(function(){
	$('#top_terminal').fadeOut(3000)
	$('#main_container').css('visibility','visible').hide().fadeIn(3000)
})
