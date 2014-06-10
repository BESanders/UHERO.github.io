$(document).ready(function() {
    Cufon.replace('#content h4.dash_sub',{
        fontFamily: 'GothamLight'
    });
    Cufon.replace('#content h4.dash_title',{
        fontFamily: 'GothamBold'
    });
    Cufon.replace('h3#county_label',{
        fontFamily: 'GothamBold'
    });
    Cufon.replace('#readout h1',{
        fontFamily: 'GothamBold'
    });
    Cufon.replace('#no_data h1', {
        fontFamily: 'GothamBold'
    });
    Cufon.replace('h3#distribution_band_label',{
        fontFamily: 'GothamBold'
    });
});

var width = 1000,
    height = 400,//860
	ts_width = 650,
	ts_height = 300,
	ts_left  = 20,
	ts_right = 20,
	yoy_height = 100;
	inset_width = 200;
	inset_height = 200;
	ts_inset_width = 200;
	ts_inset_height = 100;
	
var svg = d3.select("#map").attr({ width: width, height: height})
var time_series_svg = d3.select("#time_series").attr({ width: ts_width, height: ts_height})
var yoy_svg = d3.select("#yoy").attr({ width: ts_width, height: yoy_height})
var slider;
	
var projection = d3.geo.albersUsa()
					.translate([350,200])
					.scale([800])

var path = d3.geo.path()
			.projection(projection);
			
var color = d3.scale.linear();
var numbers = [];
var percents = [];
var all_ticket_percents = [];
var airfares = {};
var tickets = {};
var ticket_percent = {};
var yoys = {};
var column_name ="1993Q1" //quarter to draw initially
var slider_index = 1;
var quarters_array = []
var price_scale;
var inset_price_scale;
var time_scale;
var inset_time_scale;
var select_states_abbreviation = [];
var select_states_name = [];
var US_row_index = 51;
var button_clicked;
var ticket_clicked = false;
var fare_clicked = false;
var modifed_ticket_data = [];

var tooltip = d3.select("#interactive_area").append("div").attr("class", "tooltip")

var marker_tooltip = d3.select("#interactive_area").append("div").attr("class", "marker tooltip")

var time_inset;
function select_time_marker(d){
	time_series_svg.select("circle.time_marker." + d.properties.abbreviation)
		.attr("fill-opacity", 1)
}

function select_time_series(d){
	time_series_svg.select("path." + d.properties.abbreviation)
		.attr("stroke-opacity", 1)
}

function generate_yoy_for_state(d){
	yoy_svg.selectAll("rect.yoy")
		.attr("y", function(e) { return yoys[d.properties.abbreviation][e] < 0 ? bar_scale(0) : bar_scale(yoys[d.properties.abbreviation][e]) })
		.attr("height", function(e) { return Math.abs(bar_scale(yoys[d.properties.abbreviation][e]) - bar_scale(0)) })
		.attr("fill", function(e) { return e !== quarters_array[slider_index] ? "#CCC" : "#003e5f"})
}

function create_state_marker_tooltip(d){
	state_marker_tooltip.style({
		left: (parseInt(time_series_svg.select("circle.time_marker." + d.properties.abbreviation).attr("cx")) + 570) + "px",
		top: (parseInt(time_series_svg.select("circle.time_marker." + d.properties.abbreviation).attr("cy")) + 100) + "px",
		opacity: 1
	})
	
	state_marker_tooltip.html("$" + airfares[d.properties.abbreviation][quarters_array[slider_index]])
}

function create_marker_tooltip(){
	if(!ticket_clicked){
		marker_tooltip.style({
			left: (parseInt(time_series_svg.select("circle.time_marker.US").attr("cx")) - 50) + "px",
			top: (parseInt(time_series_svg.select("circle.time_marker.US").attr("cy")) + 400) + "px",
			opacity: 1
		})

		marker_tooltip.html("Avg US Fare: $" 
			+ Math.round(airfares["US"][quarters_array[slider_index]]) 
			+ "<br/>(YOY: " 
			+ Math.round(yoys["US"][quarters_array[slider_index]] * 100) 
			+ "%)")
	}
}

function create_tooltip(d){
	var bounds = path.bounds(d)
	tooltip.style({
		left: bounds[1][0] + "px",
		top: (bounds[0][1] + (bounds[1][1] - bounds[0][1])/2)+ "px",
		opacity: 1
	})
	tooltip.html(d.properties.name 
		+ "<br/>Median airfare: $" 
		+ airfares[d.properties.abbreviation][quarters_array[slider_index]]
		+ "<br/>"
		+ Math.round(tickets[d.properties.abbreviation][quarters_array[slider_index]] / tickets["US"][quarters_array[slider_index]] * 10000) / 100
		+ "% all US Tickets"
		+ "<br/>YOY: "
		+ Math.round(yoys[d.properties.abbreviation][quarters_array[slider_index]] * 1000) / 10
		+ "%"
		)
}

function change_price_text(d){
	if(fare_clicked){
		d3.select("#title").html("Median " + d.properties.name + "<br/> airfare: ")
		d3.select("#price").text("$" + airfares[d.properties.abbreviation][quarters_array[slider_index]])//.html("<h2>Median " + d.properties.name + "<br/> airfare: <br/>$" + airfares[d.properties.abbreviation][quarters_array[slider_index]] + "</h2>")
	}else if(ticket_clicked){
		d3.select("#title").html(d.properties.name + " Ticket" + "<br/> volume: ")
		d3.select("#price").text(tickets[d.properties.abbreviation][quarters_array[slider_index]])//.html("<h2>Median " + d.properties.name + "<br/> airfare: <br/>$" + airfares[d.properties.abbreviation][quarters_array[slider_index]] + "</h2>")
	}else{
		d3.select("#title").html("Median " + d.properties.name + "<br/> airfare: ")
		d3.select("#price").text("$" + airfares[d.properties.abbreviation][quarters_array[slider_index]])//.html("<h2>Median " + d.properties.name + "<br/> airfare: <br/>$" + airfares[d.properties.abbreviation][quarters_array[slider_index]] + "</h2>")
	}
}

function highlight_state(state_node, d, i) {
	state_node.attr("stroke", "orange" )
	select_time_series(d);
	select_time_marker(d);
	generate_yoy_for_state(d);
	create_tooltip(d);
	change_price_text(d);
	//create_state_marker_tooltip(d);
}

function clear_tooltip(){
	tooltip.style("opacity", 0);
}

function generate_yoy_for_US(){
	yoy_svg.selectAll("rect.yoy")
		.attr("y", function(e) { return yoys["US"][e] < 0 ? bar_scale(0) : bar_scale(yoys["US"][e]) })
		.attr("height", function(e) { return Math.abs(bar_scale(yoys["US"][e]) - bar_scale(0)) })
		.attr("fill", function(e) { return e !== quarters_array[slider_index] ? "#CCC" : "orange"})
}

function unselect_time_marker(d){
	time_series_svg.select("circle.time_marker." + d.properties.abbreviation).attr("fill-opacity", d.key === "US" ? 1 : 0)
}

function unselect_time_series(d){
	if(button_clicked === "show_weighted"){
		time_series_svg.select("path." + d.properties.abbreviation)
			.attr("stroke-opacity", time_series_svg.select("path." + d.properties.abbreviation).data()[0].percent)
	}else if(button_clicked === "show_none"){
		time_series_svg.select("path." + d.properties.abbreviation)
			.attr("stroke-opacity", 0)
	}else if(button_clicked === "show_all"){
		time_series_svg.select("path." + d.properties.abbreviation)
			.attr("stroke-opacity", 0.1)
	}else{
		time_series_svg.select("path." + d.properties.abbreviation)
			.attr("stroke-opacity", 0.1)
	}
}

function show_text_for_US(){
	if(fare_clicked){
		if(select_states_abbreviation.length === 0){
			d3.select("#title").html("Avg US Fare: ")
			d3.select("#price").text("$" + Math.round(airfares["US"][quarters_array[slider_index]]))//.html("<h2>Avg US Fare: <br/>$" + Math.round(airfares["US"][quarters_array[slider_index]]) + "</h2>")
		}else{
			d3.select("#title").html("Median " + select_states_name[select_states_name.length - 1] + "<br/>" + "airfare:")
			d3.select("#price").text("$" + airfares[select_states_abbreviation[select_states_abbreviation.length - 1]][quarters_array[slider_index]])//.html("<h2>Median " + select_states_name[select_states_name.length - 1] + "<br/> airfare: <br/>$" + airfares[select_states_abbreviation[select_states_abbreviation.length - 1]][quarters_array[slider_index]] + "</h2>")
		}
	}else if(ticket_clicked){
		if(select_states_abbreviation.length === 0){
			d3.select("#title").html("Total US Tickets: ")
			d3.select("#price").text(Math.round(tickets["US"][quarters_array[slider_index]]))//.html("<h2>Avg US Fare: <br/>$" + Math.round(airfares["US"][quarters_array[slider_index]]) + "</h2>")
		}else{
			d3.select("#title").html(select_states_name[select_states_name.length - 1] + " Ticket" + "<br/>" + "Volume:")
			d3.select("#price").text(tickets[select_states_abbreviation[select_states_abbreviation.length - 1]][quarters_array[slider_index]])//.html("<h2>Median " + select_states_name[select_states_name.length - 1] + "<br/> airfare: <br/>$" + airfares[select_states_abbreviation[select_states_abbreviation.length - 1]][quarters_array[slider_index]] + "</h2>")
		}
	}else{
		if(select_states_abbreviation.length === 0){
			d3.select("#title").text("Avg US Fare:") 
			d3.select("#price").text("$" + Math.round(airfares["US"][quarters_array[slider_index]]))
		}else{
			d3.select("#title").html("Median " + select_states_name[select_states_name.length - 1] + "<br/>airfare:")
			d3.select("#price").text("$" + airfares[select_states_abbreviation[select_states_abbreviation.length - 1]][quarters_array[slider_index]])
		}
	}
}

function clear_state(state_node, d ,i) {
	state_node.attr("stroke", "#CCC")
	clear_tooltip();
	generate_yoy_for_US();
	unselect_time_series(d);
	unselect_time_marker(d);
	show_text_for_US();	
}

function mouseover_state(d,i) {
	highlight_state(d3.select(this), d, i)
}

function mouseout_state(d,i) {
	if(select_states_abbreviation.indexOf(d.properties.abbreviation) === -1){
		clear_state(d3.select(this), d, i)
	}else{
		clear_tooltip();
		show_text_for_US(d);
	}
}

function get_percent(d){
	return Math.round(tickets[d.properties.abbreviation][quarters_array[slider_index]] / tickets["US"][quarters_array[slider_index]] * 10000) / 100
}

function text_price_fill(d,i) {
	if (["VT", "NH", "MA", "RI", "CT", "DE", "MD", "HI"].indexOf(d.properties.abbreviation) > -1 || airfares[d.properties.abbreviation][quarters_array[slider_index]] === "")
		return "#222"
	else if (airfares[d.properties.abbreviation][quarters_array[slider_index]] < 550)
		return "#222"
	else
		return "#d9e3e3"	
}

function text_ticket_fill(d,i){
	if (["VT", "NH", "MA", "RI", "CT", "DE", "MD", "HI"].indexOf(d.properties.abbreviation) > -1 || get_percent(d) === "")
		return "#222"
	else if (get_percent(d) < 50)
		return "#222"
	else
		return "#d9e3e3"
}
/*
	all_prices uses numbers array
*/
function create_all_prices_array(){
	for(var i = 0; i < numbers.length; i++){
		numbers[i] = +numbers[i];
	}

	numbers.sort(function(a,b){ return a - b;})
	all_prices = numbers;
	//all_prices = numbers.reduce(function (a,b) {return a.concat(b)}, []);
}


function get_median_of_prices(){
	overall_median_price = d3.median(all_prices)
}

function create_all_ticket_percent_array(){
	modifed_ticket_data.forEach(function(d) {
		percents = percents.concat(d3.values(d)
			.filter(function(d) {
				return !isNaN(d) && d !== "";
			}))
	})
	
	percents.sort(function(a,b){ return a - b;})
	all_ticket_percents = percents;
	// for(var i=0; i < ticket_data.length; i++){
	// 		for(var j=1; j < quarters_array.length; j++){
	// 		 	all_ticket_percents.push(Math.round(tickets[ticket_data[i].State][quarters_array[j]] / tickets["US"][quarters_array[j]] * 10000) / 100)
	// 		}
	// 	}
}

function color_scale_based_ticket_quantiles(){
	
	color.domain([0, d3.median(all_ticket_percents), d3.max(all_ticket_percents, function(d){ return d;})])
		//.range(["#fffcf7","rgb(25, 102, 127)"])
		.range(["#fffcf7", "#6a9ba9", "rgb(25, 102, 127)"])
		.interpolate()
}

function color_scale_based_price_quantiles(){
	all_prices = numbers;
	price_quantiles = d3.scale.quantile().domain(all_prices).range([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19])

	color.domain([200, price_quantiles.quantiles()[18]])
		  .range(["#fffcf7","rgb(25, 102, 127)"])//, "white", "orange"])
		  .interpolate()
}

function create_abbreviations_for_states(abbrev, states){
	abbrev.forEach(function(d){
		for(var i = 0; i < states.length; i++){
			if(states[i].properties.name === d.name){
				states[i].properties.abbreviation = d.abbreviation;
			}
		}
	});
}

var ts_inset_path = d3.svg.line()
	.y(function(d) { return inset_price_scale(+d.value) })
	.x(function(d) { return inset_time_scale(d.key) })

var ts_ticket_inset_path = d3.svg.line()
	.y(function(d){ return inset_ticket_scale(+d.value) })
	.x(function(d){ return inset_time_scale(d.key) })
	
function create_inset_time_scale(){
	inset_time_scale = d3.scale.ordinal().domain(quarters_array).rangePoints([0+ts_left,ts_inset_width - ts_right])
}

function create_inset_price_scale(){
	inset_price_scale = d3.scale.linear().range([ts_inset_height, 0]).domain([price_min, price_max])
}

function create_inset_ticket_scale(){
	inset_ticket_scale = d3.scale.linear().range([ts_inset_height, 0]).domain([ticket_min, ticket_max])
}

function show_selected_time_marker(abbreviation){
	//console.log(d3.select("svg.inset_time." + abbreviation + " g"))
	// d3.select("svg.inset_time." + abbreviation + " g").append("circle")
	// 	.attr("class", "inset_time_marker " + abbreviation)
	// 	.attr("fill", "#003e5f")
	// 	.attr("fill-opacity", 1)
	// 	.attr("r", 10)
	// 	.attr("cx", d3.select(".time_marker." + abbreviation).attr("cx"))
	// 	.attr("cy", d3.select(".time_marker." + abbreviation).attr("cy"))
	if(fare_clicked){
		var selected = d3.entries(airfares).filter(function(d){
			return d.key === abbreviation;
		})
		g.append("circle").attr("class", "inset_time_marker " + abbreviation) 
		g.select("circle.inset_time_marker." + abbreviation).data(selected)
				.attr("fill", "#003e5f")
				.attr("fill-opacity", 1)
				.attr("r", 3)
				.attr('cx', function(d) { return inset_time_scale(quarters_array[slider_index]) } )
				.attr("cy", function(d) { return inset_price_scale(d.value[quarters_array[slider_index]]) })
	}else if(ticket_clicked){
		var selected = d3.entries(ticket_percent).filter(function(d){
			return d.key === abbreviation;
		})
		g.append("circle").attr("class", "inset_time_marker " + abbreviation) 
		g.select("circle.inset_time_marker." + abbreviation).data(selected)
				.attr("fill", "#003e5f")
				.attr("fill-opacity", 1)
				.attr("r", 3)
				.attr('cx', function(d) { return inset_time_scale(quarters_array[slider_index]) } )
				.attr("cy", function(d) { return inset_ticket_scale(d.value[quarters_array[slider_index]]) })
	}else{
		var selected = d3.entries(airfares).filter(function(d){
			return d.key === abbreviation;
		})
		g.append("circle").attr("class", "inset_time_marker " + abbreviation) 
		g.select("circle.inset_time_marker." + abbreviation).data(selected)
				.attr("fill", "#003e5f")
				.attr("fill-opacity", 1)
				.attr("r", 3)
				.attr('cx', function(d) { return inset_time_scale(quarters_array[slider_index]) } )
				.attr("cy", function(d) { return inset_price_scale(d.value[quarters_array[slider_index]]) })
	}
}

function show_selected_time_series(abbreviation){
 	time_inset = d3.select(".inset." + abbreviation).append("svg").attr("class","inset_time " + abbreviation).attr({width: ts_inset_width, height: 107})
	g = time_inset.append("g")
	//var path_inset = d3.select("path.ts." + abbreviation).attr("d")
	if(fare_clicked){
		var selected = states_paths.filter(function(d){
			return d.key === abbreviation;
		})
		g.append("path").attr("class", "path_inset " + abbreviation)
		g.select("path.path_inset." + abbreviation).data(selected).attr("d", function(d) { 
			return ts_inset_path(d.value
						.filter(function(e) { return e.key !== "State"})
					) 
		}) 
		.attr("stroke", "#003e5f")
		.attr("stroke-opacity",1)
		.attr("fill", "none")
	}else if(ticket_clicked){
		var selected = ticket_paths.filter(function(d){
			return d.key === abbreviation;
		})
		g.append("path").attr("class", "path_inset " + abbreviation)
		g.select("path.path_inset." + abbreviation).data(selected).attr("d", function(d) { 
			return ts_ticket_inset_path(d.value
						.filter(function(e) { return e.key !== "State"})
					) 
		}) 
		.attr("stroke", "#003e5f")
		.attr("stroke-opacity",1)
		.attr("fill", "none")
		if(abbreviation === "CA"){
			time_inset.style("top", "51px")
		}else{
			time_inset.style("top", "-9px")
		}
	}else{
		var selected = states_paths.filter(function(d){
			return d.key === abbreviation;
		})
		g.append("path").attr("class", "path_inset " + abbreviation)
		g.select("path.path_inset." + abbreviation).data(selected).attr("d", function(d) { 
			return ts_inset_path(d.value
						.filter(function(e) { return e.key !== "State"})
					) 
		}) 
		.attr("stroke", "#003e5f")
		.attr("stroke-opacity",1)
		.attr("fill", "none")
	}
	// var scale = 0.2
	// 	var translate = [145,60]
	// 	g.call(zoom.translate(translate).scale(scale).event)
	
}

var g;

function show_selected(abbreviation, state){
	var inset = d3.select("#interactive_area").append("div").attr("class", "inset " + abbreviation).append("svg").attr("class", "inset_svg " + abbreviation).attr({width: inset_width, height: inset_height})
	g = inset.append("g")
	var path_inset = d3.select("path." + abbreviation).attr("d")
	g.append("path").attr("d", path_inset).attr("fill", "#95b7c0")
	var bounds = path.bounds(state)
	var	  dx = bounds[1][0] - bounds[0][0],
	      dy = bounds[1][1] - bounds[0][1],
	      x = (bounds[0][0] + bounds[1][0]) / 2,
	      y = (bounds[0][1] + bounds[1][1]) / 2,
	      scale = .3 / Math.max(dx / inset_width, dy / inset_height),
	      translate = [inset_width / 2 - scale * x, inset_height / 2 - scale * y];
	if(abbreviation === "AK"){
		  scale = .3 / Math.min(dx / inset_width, dy / inset_height)
	      translate = [inset_width / 2 - scale * x, inset_height / 2 - scale * y]
	}
	g.call(zoom.translate(translate).scale(scale).event)
}

function selected_text(state){	
	d3.select(".inset." + state.properties.abbreviation).append("h4").attr("class", "state_name " + state.properties.abbreviation).text(state.properties.name).style({"position":"absolute", "left":"10px", "top":"70px"})
	if(fare_clicked){
		var selected = d3.entries(airfares).filter(function(d){
			return d.key === state.properties.abbreviation;
		})
		d3.select(".inset." + state.properties.abbreviation)
			.data(selected)
			.append("h4")
			.attr("class", "label " + state.properties.abbreviation)
			.text(function(d){ return "$" + d.value[quarters_array[slider_index]]; })
			.style({"position":"absolute", "left":"250px", "top":"99px"})
	}else if(ticket_clicked){
		var selected = d3.entries(ticket_percent).filter(function(d){
			return d.key === state.properties.abbreviation;
		})
		d3.select(".inset." + state.properties.abbreviation)
			.data(selected)
			.append("h4")
			.attr("class", "label " + state.properties.abbreviation)
			.text(function(d){ return d.value[quarters_array[slider_index]] + "%"; })
			.style({"position":"absolute", "left":"250px", "top":"99px"})
	}else{
		var selected = d3.entries(airfares).filter(function(d){
			return d.key === state.properties.abbreviation;
		})
		d3.select(".inset." + state.properties.abbreviation)
			.data(selected)
			.append("h4")
			.attr("class", "label " + state.properties.abbreviation)
			.text(function(d){ return "$" + d.value[quarters_array[slider_index]]; })
			.style({"position":"absolute", "left":"250px", "top":"99px"})
	}
}

function remove_selected(abbreviation){
	d3.select(".inset." + abbreviation).remove();
}

zoom = d3.behavior.zoom()
    .translate([0, 0])
    .scale(1)
    .scaleExtent([1, 40])
    .on("zoom", zoomed);

function zoomed() {
	//if (d3.event.sourceEvent) { d3.select("#reset_container").style("display", "block")	}
	g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function click_on_state(d,i){
	if(select_states_abbreviation.indexOf(d.properties.abbreviation) === -1){
		highlight_state(d3.select(this), d, i)
		select_states_abbreviation.push(d.properties.abbreviation)
		select_states_name.push(d.properties.name)
		show_selected(d.properties.abbreviation, d);
		show_selected_time_series(d.properties.abbreviation)
		show_selected_time_marker(d.properties.abbreviation)
		selected_text(d)
	}else{
		clear_state(d3.select(this), d, i)
		select_states_abbreviation.splice(select_states_abbreviation.indexOf(d.properties.abbreviation),1)
		select_states_name.splice(select_states_name.indexOf(d.properties.name),1)
		remove_selected(d.properties.abbreviation);
	}
}

function create_states(states){
	svg.selectAll("path.states")
			.data(states)
			.enter()
			.append("path")
			.attr("class", function(d) { return "state " + d.properties.name + " " + d.properties.abbreviation;;})
			.attr("fill", function(d){
				if(d.properties.abbreviation === "HI"){
					return 0;
				}else{
					return color(airfares[d.properties.abbreviation][column_name]);
				}
			})
			.attr("stroke", "#CCC")
			.attr("d",path)
			.on("mouseover", mouseover_state)
			.on("mouseout", mouseout_state)
			.on("click", click_on_state)
}

var other_states = {
	"Vermont":{"x-text offset":-20, "y-text offset":-50, "x1":"570px", "y1":"50px", "x2":"585px", "y2":"90px"},
	"New Hampshire":{"x-text offset":70, "y-text offset":5, "x1":"600px", "y1":"102px", "x2":"650px", "y2":"102px"},
	"Massachusetts":{"x-text offset":70, "y-text offset":5, "x1":"600px", "y1":"115px", "x2":"650px", "y2":"115px"},
	"Rhode Island":{"x-text offset":60, "y-text offset":20, "x1":"605px", "y1":"125px", "x2":"650px", "y2":"140px"},
	"Connecticut":{"x-text offset":60, "y-text offset":30, "x1":"590px", "y1":"127px", "x2":"640px", "y2":"150px"},
	"Delaware":{"x-text offset":75, "y-text offset":5, "x1":"580px", "y1":"175px","x2":"640px", "y2":"175px"},
	"Maryland":{"x-text offset":94, "y-text offset":15, "x1":"580px", "y1":"185px", "x2":"640px", "y2":"185px"} 
};

function attach_text_to_states(states){
		svg.selectAll("text.states")
			.data(states)
			.enter()
			.append("text")
			.attr("class", function(d) { return "state " + d.properties.name })
			.text(function(d){
				if(d.properties.abbreviation === "HI" || airfares[d.properties.abbreviation][column_name] === ""){
					return "$" + 0;
				}else{
					return "$" + airfares[d.properties.abbreviation][column_name];
				}
			})
		    .attr("x", function(d){
				return other_states[d.properties.name] !== undefined ?  path.centroid(d)[0] + other_states[d.properties.name]["x-text offset"] : path.centroid(d)[0];
		    })
		    .attr("y", function(d){
				return other_states[d.properties.name] !== undefined ?  path.centroid(d)[1] + other_states[d.properties.name]["y-text offset"] : path.centroid(d)[1];
		    })
			.attr("text-anchor", "middle")
			.attr("font-size", "10px")
			.attr("fill", text_price_fill)
}

function create_label_lines(){
	svg.selectAll("line.states")
		.data(d3.entries(other_states))
		.enter()
		.append("line")
		.attr("class", function(d){
			return d.key;
		})
		.attr("x1", function(d){
			return d.value["x1"];
		})
		.attr("y1", function(d){
			return d.value["y1"];
		})
		.attr("x2", function(d){
			return d.value["x2"];
		})
		.attr("y2", function(d){
			 return d.value["y2"];
		})
		.attr("stroke", "black")
}

function display_year(){
	d3.select("#slider").append("h3").attr("class","year").text([column_name]);
}

/*
	Draws us map using fare_medians_state.csv
*/
function initial_draw_map(data){
	//data = fare_medians_state.csv
	create_all_prices_array();
	get_median_of_prices();
	create_all_ticket_percent_array();
	color_scale_based_price_quantiles();
		//.range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)","rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)"])

	d3.json("us-states.json",function(states){
		states.features.pop()
		d3.json("states.json",function(abbrev){
			create_abbreviations_for_states(abbrev, states.features);
			create_states(states.features);
			attach_text_to_states(states.features)
			create_label_lines();
		});
		
	});
	display_year();
}


var ts_path = d3.svg.line()
	.y(function(d) { return price_scale(+d.value) })
	.x(function(d) { return time_scale(d.key) })

var ts_ticket_path = d3.svg.line()
	.y(function(d){ return ticket_scale(+d.value) })
	.x(function(d){ return time_scale(d.key) })

/*
	all_prices array uses d3.entries(airfares)
*/
function create_price_scale(states_to_draw){
	//all_prices: arrays of all values with arrays represented per state and used for price scale
	all_prices = states_to_draw.map(function(d) { 
		return d3.values(d.value)
			.map(function(e) {return +e }) 
	})
	
	price_min = d3.min(d3.min(all_prices))
	price_max = d3.max(d3.max(all_prices))

	price_scale = d3.scale.linear().range([ts_height, 0]).domain([price_min, price_max])
}

function create_ticket_scale(states_to_draw){
	all_tickets = states_to_draw.map(function(d) {
		return d3.values(d.value)
			.map(function(e, i) { return +e;/*+e !== NaN && i !== 0  ? Math.round(+e/tickets["US"][quarters_array[i]] * 10000) / 100 : NaN;*/})
	})
	
	//all_tickets = all_tickets.splice(0,51)
	ticket_min = d3.min(d3.min(all_tickets))
	ticket_max = d3.max(d3.max(all_tickets))
	
	ticket_scale = d3.scale.linear().range([ts_height * 0.40, 0]).domain([ticket_min, ticket_max])
}

/*
	Generates time series paths for each state in an array
*/

function generate_state_paths_array(states_to_draw, tickets_to_draw){
	//states_paths = key is state, value is array of objects with key as "title" and value as "price"
	var US_total_tickets = d3.sum(d3.values(ticket_data[US_row_index]))
	states_to_draw.splice(51,1)
	states_paths = states_to_draw.map(function(d, i) { return {key: d.key, value: d3.entries(d.value), percent: (d3.sum(d3.values(ticket_data[i]))/US_total_tickets) }})
	ticket_paths = tickets_to_draw.map(function(d, i) { return {key: d.key, value: d3.entries(d.value), percent: (d3.sum(d3.values(ticket_data[i]))/US_total_tickets) }})
}

/*
	Create time markers for each state 
*/
function create_time_markers(states_to_draw){
	var time_markers = time_series_svg.selectAll("circle.time_marker")
		.data(states_to_draw)
		
	time_markers.enter()
		.append("circle")
		.attr("class", function(d) { return "time_marker " + d.key })
		.attr("fill", function(d) { return d.key === "US" ? "orange" : "#003e5f" })
		.attr("fill-opacity", function(d) { return d.key === "US" ? 1 : 0 })
		.attr("r", 3)
		.attr("cx", function(d) { return time_scale(quarters_array[slider_index]) } )
		.attr("cy", function(d) { return price_scale(+d.value[quarters_array[slider_index]]) })
}

function create_ticket_time_markers(tickets_to_draw){
	time_series_svg.selectAll("circle.time_marker")
		.data(tickets_to_draw)
		.attr("cx", function(d) { return time_scale(quarters_array[slider_index]) } )
		.attr("cy", function(d) { return ticket_scale(+d.value[quarters_array[slider_index]]) } )
}

function create_price_time_markers(states_to_draw){
	time_series_svg.selectAll("circle.time_marker")
		.data(states_to_draw)
		.attr("cx", function(d) { return time_scale(quarters_array[slider_index]) } )
		.attr("cy", function(d) { return price_scale(+d.value[quarters_array[slider_index]]) } )
}

function create_time_series_paths(){
	var ts_paths = time_series_svg.selectAll("path.ts")
		.data(states_paths)
	
	ts_paths.enter()
		.append("path")
			
	ts_paths
		.attr("d", function(d) { 
			return ts_path(d.value
				.filter(function(e) { return e.key !== "State"})
			) 
		})
		.attr("class", function(d) { return "ts " + d.key })
		.attr("stroke", function(d) { return d.key === "US" ? "orange" : "#003e5f" })
		.attr("stroke-opacity", function(d) { return d.key === "US" ? 1 : 0.1 })
		.attr("fill", "none")
		.on("mouseover", function(d, i) {
			d3.select(this).attr("stroke-opacity", 1)
			time_series_svg.select("circle.time_marker." + d.key).attr("fill-opacity", 1)
			state_node = svg.select("path." + d.key)
			highlight_state(state_node, state_node.data()[0], i)
			change_price_text(state_node.data()[0])
		})
		.on("mouseout", function(d, i) {
			if(select_states_abbreviation.indexOf(d.key) === -1){
				time_series_svg.select("circle.time_marker." + d.key).attr("fill-opacity", d.key === "US" ? 1 : 0)
				d3.select(this).attr("stroke-opacity", d.key === "US" ? 1 : 0.1)
				state_node = svg.select("path." + d.key)
				clear_state(state_node, state_node.data()[0] , i)
				show_text_for_US(state_node.data()[0])
			}
		})
		.on("click", function(d, i){
			if(select_states_abbreviation.indexOf(d.key) === -1){
				d3.select(this).attr("stroke-opacity", 1)
				time_series_svg.select("circle.time_marker." + d.key).attr("fill-opacity", 1)
				state_node = svg.select("path." + d.key)
				highlight_state(state_node, state_node.data()[0], i)
				select_states_abbreviation.push(d.key)
				show_selected(d.key, state_node.data()[0])
				show_selected_time_series(d.key)
				show_selected_time_marker(d.key)
				selected_text(state_node.data()[0])
			}else{
				time_series_svg.select("circle.time_marker." + d.key).attr("fill-opacity", d.key === "US" ? 1 : 0)
				d3.select(this).attr("stroke-opacity", d.key === "US" ? 1 : 0.1)
				state_node = svg.select("path." + d.key)
				clear_state(state_node, state_node.data()[0] , i)
				select_states_abbreviation.splice(select_states_abbreviation.indexOf(d.key),1)
				remove_selected(d.key)
			}
		})
}

function create_ticket_time_paths(){
	time_series_svg.selectAll("path.ts")
		.data(ticket_paths)
		.attr("d", function(d){
			return ts_ticket_path(d.value
				.filter(function(e) { return e.key !== "State"})
			)
		})
}

function create_price_time_paths(){
	time_series_svg.selectAll("path.ts")
		.data(states_paths)
		.attr("d", function(d){
			return ts_path(d.value
				.filter(function(e) { return e.key !== "State"})
			)
		})
}

/*
	Draws time series using d3.entries(airfares) with key as state and fare_median_states as values
	x-axis is the year, path is the prices, y-axis is the states
*/
function draw_time_series(states_to_draw, tickets_to_draw) {
	//states_to_draw = d3.entries(airfares)
	create_price_scale(states_to_draw);
	create_ticket_scale(tickets_to_draw);
	create_inset_price_scale();
	create_inset_ticket_scale();
	generate_state_paths_array(states_to_draw, tickets_to_draw);
	create_time_markers(states_to_draw);
	create_time_series_paths();	
	draw_bars(states_to_draw)
}


function draw_bars(states_to_draw) {
	var bar_width = 2
	bar_scale = d3.scale.linear().range([yoy_height, 0]).domain([-.25,.25])

	var bars = yoy_svg.selectAll("rect.yoy")
		.data(quarters_array.filter(function(d) {return d !== "State"}))
		.enter()
		.append("rect")
		.attr("class", function(d) { return "yoy " + d})
		.attr("x", function(d) { return time_scale(d) - bar_width / 2})
		.attr("y", function(d) { return yoys["US"][d] < 0 ? bar_scale(0) : bar_scale(yoys["US"][d]) })
		.attr("height", function(d) { return Math.abs(bar_scale(yoys["US"][d]) - bar_scale(0)) })
		.attr("width", bar_width )
		.attr("fill", function(d) { return d !== quarters_array[slider_index] ? "#CCC" : "orange"})
}

//match state with fare_medians_state using "airfare" object
function match_states_with_prices(data){
	data.forEach(function(d){
		airfares[d.State] = d
		numbers = numbers.concat(d3.values(d)
			.filter(function(d) {
				return !isNaN(d) && d !== "";
			}))
	})
}
	
//match total_pass_state using "ticket" object
function match_states_with_tickets(ticket_data){
	ticket_data.forEach(function(d) { tickets[d.State] = d });
}


//match total_pass_state using "yoys" object
function match_states_with_yoy(yoy_data){
	yoy_data.forEach(function(d) { yoys[d.State] = d });
}

//get all keys of the total_pass_state.csv and create time scale
function create_time_scale(data){
	quarters_array = d3.keys(data[0])
	time_scale = d3.scale.ordinal().domain(quarters_array).rangePoints([0+ts_left,ts_width - ts_right])
}

function display_year_and_avg_us_fare(evt, value){
	var text = d3.select(".d3-slider-handle").style("bottom").split("px");
	//console.log(text)
	d3.select("#slider h3.year").text(quarters_array[value]).style("bottom", (parseInt(text[0]) - 12) + "px");
	if(fare_clicked){
		if(select_states_abbreviation.length === 0){
			d3.select("#title").text("Avg US Fare:") 
			d3.select("#price").text("$" + Math.round(airfares["US"][quarters_array[slider_index]]))
		}else{
			d3.select("#title").html("Median " + select_states_name[select_states_name.length - 1] + "<br/>airfare:")
			d3.select("#price").text("$" + airfares[select_states_abbreviation[select_states_abbreviation.length - 1]][quarters_array[slider_index]])
		}
	}else if(ticket_clicked){
		if(select_states_abbreviation.length === 0){
			d3.select("#title").text("Total US Tickets:") 
			d3.select("#price").text(Math.round(tickets["US"][quarters_array[slider_index]]))
		}else{
			d3.select("#title").html(select_states_name[select_states_name.length - 1] + " Ticket" + "<br/>Volume:")
			d3.select("#price").text(tickets[select_states_abbreviation[select_states_abbreviation.length - 1]][quarters_array[slider_index]])
		}
	}else{
		if(select_states_abbreviation.length === 0){
			d3.select("#title").text("Avg US Fare:") 
			d3.select("#price").text("$" + Math.round(airfares["US"][quarters_array[slider_index]]))
		}else{
			d3.select("#title").html("Median " + select_states_name[select_states_name.length - 1] + "<br/>airfare:")
			d3.select("#price").text("$" + airfares[select_states_abbreviation[select_states_abbreviation.length - 1]][quarters_array[slider_index]])
		}
	}
		// + "<br/> (YOY: " 
		// + Math.round(yoys["US"][quarters_array[slider_index]] * 100) 
		// + "%)</h2>")
}

function change_state_color(){
	if(fare_clicked){
		d3.selectAll("path.state")
	 		.attr("fill", function(d){
				if(d.properties.abbreviation === "HI"){
					return 0;
				}else{
					return color(airfares[d.properties.abbreviation][quarters_array[slider_index]]);
				}
			})
			.on("mouseover", mouseover_state)
			.on("mouseout", mouseout_state)
		
	}else if(ticket_clicked){
		d3.selectAll("path.state")
	 		.attr("fill", function(d){
				if(d.properties.abbreviation === "HI"){
					return 0;
				}else{
					return color(ticket_percent[d.properties.abbreviation][quarters_array[slider_index]]);
				}
			})
			.on("mouseover", mouseover_state)
			.on("mouseout", mouseout_state)
	}else{
		d3.selectAll("path.state")
	 		.attr("fill", function(d){
				if(d.properties.abbreviation === "HI"){
					return 0;
				}else{
					return color(airfares[d.properties.abbreviation][quarters_array[slider_index]]);
				}
			})
			.on("mouseover", mouseover_state)
			.on("mouseout", mouseout_state)
	}
}

function change_text_on_state(){
	if(fare_clicked){
		d3.selectAll("text.state")
			.text(function(d){
				if(d.properties.abbreviation === "HI" || airfares[d.properties.abbreviation][quarters_array[slider_index]] === ""){
					return "$" + 0;
				}else{
					return "$" + airfares[d.properties.abbreviation][quarters_array[slider_index]];
				}
			})
			.attr("fill", text_price_fill)
	}else if(ticket_clicked){
		d3.selectAll("text.state")
			.text(function(d){
				if(d.properties.abbreviation === "HI" || tickets[d.properties.abbreviation][quarters_array[slider_index]] === ""){
					return 0;
				}else{
					return tickets[d.properties.abbreviation][quarters_array[slider_index]];
				}
			})
			.attr("fill", text_ticket_fill)
	}else{
		d3.selectAll("text.state")
			.text(function(d){
				if(d.properties.abbreviation === "HI" || airfares[d.properties.abbreviation][quarters_array[slider_index]] === ""){
					return "$" + 0;
				}else{
					return "$" + airfares[d.properties.abbreviation][quarters_array[slider_index]];
				}
			})
			.attr("fill", text_price_fill)
	}
}

function move_selected_time_marker(){
	if(fare_clicked){
		d3.selectAll("circle.inset_time_marker")
			.attr("cx", function(d) { return inset_time_scale(quarters_array[slider_index]) })
			.attr("cy", function(d) { return inset_price_scale(d.value[quarters_array[slider_index]]) })
	}else if(ticket_clicked){
		d3.selectAll("circle.inset_time_marker")
			.attr("cx", function(d) { return inset_time_scale(quarters_array[slider_index]) })
			.attr("cy", function(d) { return inset_ticket_scale(d.value[quarters_array[slider_index]]) })
	}else{
		d3.selectAll("circle.inset_time_marker")
			.attr("cx", function(d) { return inset_time_scale(quarters_array[slider_index]) })
			.attr("cy", function(d) { return inset_price_scale(d.value[quarters_array[slider_index]]) })
	}
}

function change_text_label(){
	if(fare_clicked){
		d3.selectAll("h4.label")
			.text(function(d){ return "$" + d.value[quarters_array[slider_index]];})
	}else if(ticket_clicked){
		d3.selectAll("h4.label")
			.text(function(d){ return d.value[quarters_array[slider_index]] + "%";})
	}else{
		d3.selectAll("h4.label")
			.text(function(d){ return "$" + d.value[quarters_array[slider_index]];})
	}
}

function move_time_marker(){
	if(fare_clicked){
		time_series_svg.selectAll("circle.time_marker")
			.attr("cx", function(d) { return time_scale(quarters_array[slider_index]) } )
			.attr("cy", function(d) { return price_scale(+d.value[quarters_array[slider_index]]) })
	}else if(ticket_clicked){
		time_series_svg.selectAll("circle.time_marker")
			.attr("cx", function(d) { return time_scale(quarters_array[slider_index]) } )
			.attr("cy", function(d) { return ticket_scale(+d.value[quarters_array[slider_index]]) })
	}else{
		time_series_svg.selectAll("circle.time_marker")
			.attr("cx", function(d) { return time_scale(quarters_array[slider_index]) } )
			.attr("cy", function(d) { return price_scale(+d.value[quarters_array[slider_index]]) })
	}
		
}

function highlight_yoy_bar(){
	yoy_svg.selectAll("rect.yoy")
		.attr("fill", function(d) { return d !== quarters_array[slider_index] ? "#CCC" : "orange"})
}

function hide_marker_tooltip(){
	d3.select("#interactive_area").on("mouseover", function(){
		marker_tooltip.style("opacity", 0)
	})
}


function create_slider(data){
	console.log(data)
	slider = d3.select("#container").append("div").attr("class", "slider")	
	slider.call(d3.slider().min(1).max(quarters_array.length-1).value(1).step(1).orientation("vertical").on("slide", function(evt,value){
		//console.log(evt.y)
		slider_index = value;
		display_year_and_avg_us_fare(evt,value);
		change_state_color();
		change_text_on_state();
		move_time_marker();
		highlight_yoy_bar();
		create_marker_tooltip();	
		hide_marker_tooltip();
		move_selected_time_marker();
		change_text_label();
	}))
}

function show_all_time_series(){
	d3.select("#show_all").on("click", function(){
		button_clicked = "show_all"
		d3.selectAll("path.ts")
			.attr("stroke-opacity", function(d) { 
				if(select_states_abbreviation.indexOf(d.key) === -1){
					return d.key === "US" ? 1 : 0.1;
				}else{
					return 1;
				}
			})
	})
}


function show_weighted_time_series(){
	d3.select("#show_weighted").on("click", function(){
		button_clicked = "show_weighted";
		d3.selectAll("path.ts")
			.attr("stroke-opacity", function(d){
				if(select_states_abbreviation.indexOf(d.key) === -1){ 			
					return d.percent;
				}else{
					return 1;
				}
			})	
			.on("mouseout", function(d,i){
				if(select_states_abbreviation.indexOf(d.key) === -1){							
					time_series_svg.select("circle.time_marker." + d.key).attr("fill-opacity", d.key === "US" ? 1 : 0)
					d3.select(this).attr("stroke-opacity", d.key === "US" ? 1 : d.percent)
					state_node = svg.select("path." + d.key)
					clear_state(state_node, state_node.data()[0] , i)	
				}
			})
	})
}

function show_no_time_series(){
	d3.select("#show_none").on("click", function(){
		button_clicked = "show_none"
		d3.selectAll("path.ts")
			.attr("stroke-opacity", function(d){
				if(select_states_abbreviation.indexOf(d.key) === -1){ 
					return d.key === "US" ? 1 : 0;
				}else{
					return 1;
				}
			})
			.on("mouseout", function(d,i){
				if(select_states_abbreviation.indexOf(d.key) == -1){				
					time_series_svg.select("circle.time_marker." + d.key).attr("fill-opacity", d.key === "US" ? 1 : 0)
					d3.select(this).attr("stroke-opacity", d.key === "US" ? 1 : 0)
					state_node = svg.select("path." + d.key)
					clear_state(state_node, state_node.data()[0] , i)	
				}
			})
	})
}

// function show_text(){ 
// 	if(ticket_clicked){
// 		d3.selectAll("text.state").text(function(d){
// 			if(d.properties.abbreviation === "HI" || tickets[d.properties.abbreviation][quarters_array[slider_index]] === ""){
// 				return 0;
// 			}else{
// 				return tickets[d.properties.abbreviation][quarters_array[slider_index]];
// 			}
// 		})
// 	}else if(fare_clicked){
// 		d3.selectAll("text.state").text(function(d){
// 			if(d.properties.abbreviation === "HI" || airfares[d.properties.abbreviation][quarters_array[slider_index]] === ""){
// 				return "$" + 0;
// 			}else{
// 				return "$" + airfares[d.properties.abbreviation][quarters_array[slider_index]];
// 			}
// 		})
// 	}
// }

function calculate_ticket_percentage_array(ticket_data){
	ticket_data.forEach(function(d, i){
		var obj = {}
		d3.keys(d).forEach(function(e){
			obj[e] = e !== "State" ? Math.round(+d[e] / tickets["US"][e] * 10000) / 100 : d[e]; 
		})
		modifed_ticket_data.push(obj)
	})
	
	modifed_ticket_data.forEach(function(d){
		ticket_percent[d.State] = d;
	})
}

function correct_time_series(){
	// if(fare_clicked){
	// 	for(var  i = 0; i < select_states_abbreviation.length; i++){
	// 		var selected = states_paths.filter(function(d){
	// 			return d.key === select_states_abbreviation[i];
	// 		})
	// 		var selection = g.select("path.path_inset." + select_states_abbreviation[i]).data(selected).attr("d", function(d) { 
	// 			return ts_inset_path(d.value
	// 						.filter(function(e) { return e.key !== "State"})
	// 					) 
	// 		})
	// 		console.log(selection)
	// 		time_inset.style("top", "34px")
	// 	}
	// }else if(ticket_clicked){
	// 	for(var  i = 0; i < select_states_abbreviation.length; i++){
	// 		var selected = ticket_paths.filter(function(d){
	// 			return d.key === select_states_abbreviation[i];
	// 		})
	// 		console.log(select_states_abbreviation[i])
	// 		var selection = g.select("path.path_inset." + select_states_abbreviation[i]).data(selected).attr("d", function(d) { 
	// 			return ts_ticket_inset_path(d.value
	// 				.filter(function(e) { return e.key !== "State"})
	// 			) 
	// 		})
	// 		console.log(selection)
	// 		if(select_states_abbreviation[i] === "CA"){
	// 			time_inset.style("top", "51px")
	// 		}else{
	// 			time_inset.style("top", "-9px")
	// 		}
	// 	}
	// }
	if(ticket_clicked){
		var selected = [];
		ticket_paths.forEach(function(d){
			if(select_states_abbreviation.indexOf(d.key) !== -1){
				selected[select_states_abbreviation.indexOf(d.key)] = d;
			}
		})
		
		d3.selectAll("path.path_inset").data(selected).attr("d", function(d){
			console.log(d)
				return ts_ticket_inset_path(d.value
					.filter(function(e) { return e.key !== "State"})
				)
		})
		
		d3.selectAll(".inset_time").style("top", "-9px")
		if(select_states_abbreviation[select_states_abbreviation.indexOf("CA")] === "CA"){
			d3.select(".inset_time.CA").style("top", "51px")
		}
	}else if(fare_clicked){
		var selected = [];
		states_paths.forEach(function(d){
			if(select_states_abbreviation.indexOf(d.key) !== -1){
				selected[select_states_abbreviation.indexOf(d.key)] = d;
			}
		})
		
		d3.selectAll("path.path_inset").data(selected).attr("d", function(d){
			console.log(d)
				return ts_inset_path(d.value
					.filter(function(e) { return e.key !== "State"})
				)
		})
		d3.selectAll(".inset_time").style("top", "34px")
	}
}

function correct_time_markers(){
	if(ticket_clicked){
		var selected = [];
		d3.entries(ticket_percent).forEach(function(d){
			if(select_states_abbreviation.indexOf(d.key) !== -1){
				selected[select_states_abbreviation.indexOf(d.key)] = d;
			}
		})
		
		d3.selectAll("circle.inset_time_marker")
			.data(selected)
			.attr("cx", function(d) { return inset_time_scale(quarters_array[slider_index]) })
			.attr("cy", function(d) { return inset_ticket_scale(d.value[quarters_array[slider_index]])})
		
		// d3.selectAll(".inset_time").style("top", "-9px")
		// if(select_states_abbreviation[select_states_abbreviation.indexOf("CA")] === "CA"){
		// 	d3.select(".inset_time.CA").style("top", "51px")
		// }
	}else if(fare_clicked){
		var selected = [];
		d3.entries(airfares).forEach(function(d){
			if(select_states_abbreviation.indexOf(d.key) !== -1){
				selected[select_states_abbreviation.indexOf(d.key)] = d;
			}
		})
		
		d3.selectAll("circle.inset_time_marker")
			.data(selected)
			.attr("cx", function(d) { return inset_time_scale(quarters_array[slider_index]) })
			.attr("cy", function(d) { return inset_price_scale(d.value[quarters_array[slider_index]]) })
			
		//d3.selectAll(".inset_time").style("top", "34px")
	}
}

function correct_labels(){
	if(ticket_clicked){
		var selected = [];
		d3.entries(ticket_percent).forEach(function(d){
			if(select_states_abbreviation.indexOf(d.key) !== -1){
				selected[select_states_abbreviation.indexOf(d.key)] = d;
			}
		})
		
		d3.selectAll("h4.label")
			.data(selected)
			.text(function(d){return d.value[quarters_array[slider_index]] + "%"})
		
		// d3.selectAll(".inset_time").style("top", "-9px")
		// if(select_states_abbreviation[select_states_abbreviation.indexOf("CA")] === "CA"){
		// 	d3.select(".inset_time.CA").style("top", "51px")
		// }
	}else if(fare_clicked){
		var selected = [];
		d3.entries(airfares).forEach(function(d){
			if(select_states_abbreviation.indexOf(d.key) !== -1){
				selected[select_states_abbreviation.indexOf(d.key)] = d;
			}
		})
		
		d3.selectAll("h4.label")
			.data(selected)
			.text(function(d){return "$" + d.value[quarters_array[slider_index]]})
			
		//d3.selectAll(".inset_time").style("top", "34px")
	}
}

function show_ticket_data(tickets_to_draw){
	d3.select("#tickets").on("click", function(){
		ticket_clicked = true;
		fare_clicked = false;
		color_scale_based_ticket_quantiles();
		change_text_on_state();
		change_state_color();
		create_ticket_time_markers(tickets_to_draw);
		create_ticket_time_paths();
		show_text_for_US();
		correct_time_series();
		correct_time_markers();
		correct_labels();
	})
}

function show_fare_data(states_to_draw){
	states_to_draw.splice(51,1)
	d3.select("#fares").on("click", function(){
		fare_clicked = true;
		ticket_clicked = false;
		color_scale_based_price_quantiles();
		change_text_on_state(); 
		change_state_color();
		create_price_time_markers(states_to_draw);
		create_price_time_paths();
		show_text_for_US();
		correct_time_series();
		correct_time_markers();
		correct_labels();
	})
}
/*
	Load in total_pass_state.csv (ticket_data), fare_median_pchya.csv (yoy_data), fare_medians_state.csv(data) using queue
*/
var ticket_data = [];
var yoy_data = [];
var q = queue()
q.defer(d3.csv, "total_pass_state.csv")
q.defer(d3.csv, "fare_median_pchya.csv")
q.defer(d3.csv, "fare_medians_state.csv")
q.awaitAll(function(error, results){
	ticket_data = results[0];
	yoy_data = results[1];
	match_states_with_prices(results[2]);
	match_states_with_tickets(ticket_data);
	calculate_ticket_percentage_array(ticket_data)
	match_states_with_yoy(yoy_data)
	create_time_scale(results[2]);
	create_inset_time_scale();
	initial_draw_map(results[2]);
	draw_time_series(d3.entries(airfares), d3.entries(ticket_percent));
	create_slider(results[2]); 
	show_all_time_series();
	show_weighted_time_series();
	show_no_time_series();
	show_ticket_data(d3.entries(ticket_percent));
	show_fare_data(d3.entries(airfares));
})

// d3.csv("total_pass_state.csv", function(ticket_data) {
// 	d3.csv("fare_median_pchya.csv", function(yoy_data) {
// 	d3.csv("fare_medians_state.csv", function(data){
// 		match_states_with_prices(data);
// 		match_states_with_tickets(ticket_data);
// 		match_states_with_yoy(yoy_data)
// 		create_time_scale(data);
// 		initial_draw_map(data)
// 		draw_time_series(d3.entries(airfares)) 
// 		create_slider(data);
// 		//draw_time_series([{key:"US", value:airfares["US"]}])
// 	})
// 	})
// })

// d3.csv("Airfares_by_State.csv", function(data){
// 	draw_map("1993Q1", data)
// 	d3.select("#interactive_area").selectAll("a")
// 		.data(d3.keys(data[0]))
// 		.enter()
// 		.append("a")
// 		.html(function(d){ 
// 			if(d !== "State"){
// 				if(d.indexOf("Q4") === -1){
// 					return d + " | ";
// 				}else{
// 					return d + "<br/>";
// 				}
// 			}
// 		})
// 		.attr("href", "javascript:;")
// 		.on("click", function(d){
// 			draw_map(d,data);
// 		})
// })