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
	ts_height = 400,
	ts_left  = 20,
	ts_right = 20,
	yoy_height = 100;//100
	inset_width = 150;
	inset_height = 150;
	ts_inset_width = 200;
	ts_inset_height = 30;

var all_states_data = []
var us_data = {}
var quarters_array = []
var selected_states = [];
var selected_mode = "fares";
var selected_sort = "alphabetical";
var ticket_max;
var yoy_max;
var yoy_min;
var price_max;
var sum_of_tickets_array = [];
var column_name ="1993Q1" //quarter to draw initially
var slider_index = 0;
var US_row_index = 51;

var svg = d3.select("#map").attr({ width: width, height: height})
var bar_svg = d3.select("#bar_chart").attr({ width: ts_width, height: yoy_height})
var tooltip = d3.select("#interactive_area").append("div").attr("class", "tooltip")
var slider

var inset_scale;
var inset_time_scale;
var bar_height_scale = d3.scale.linear(); 

var ts_inset_path = d3.svg.line()
	.y(function(d) { return inset_scale(d.value) })
	.x(function(d) { return inset_time_scale(d.key) })

var projection = d3.geo.albersUsa()
	.translate([350,200])
	.scale([800])

var path = d3.geo.path()
	.projection(projection);
	
var data_states = {
	fares: {
		desc: "Avg Fare: ",
		path_height: "34px"
	},
	tickets: {
		desc: "Total Tickets: ",
		path_height: "-9px"
	},
	yoy: {
		desc: "YOY: ",
		path_height: "-9px"
	}
};

var color = d3.scale.linear()

function string_formatter(value, mode){
	switch(mode){
		case "fares": return "$" + value;
		
		case "tickets": return value;
		
		case "yoy": return Math.round(value) + "%";
	}
}


function tooltip_html(d) {
	return d.properties.name 
	+ "<br/>Median airfare: $" 
	+ d.data["fares"]["array"][quarters_array[slider_index]]
	+ "<br/>"
	+ Math.round(d.data["tickets"]["array"][quarters_array[slider_index]] / us_data["tickets"]["array"][quarters_array[slider_index]] * 10000) / 100
	+ "% all US Tickets"
	+ "<br/>YOY: "
	+ Math.round(d.data["yoy"]["array"][quarters_array[slider_index]])
	+ "%"
	
}

function highlight_state(state_node, d, i) {
	d3.select("g.state_g." + d.abbreviation + " path").attr("stroke", "orange" )
	
	d3.select("h1#state").text(d.properties.name)
	switching_number_labels(d.data, selected_mode)
	var bounds = path.bounds(d)
	tooltip
		.style({
			left: bounds[1][0] + "px",
			top: (bounds[0][1] + (bounds[1][1] - bounds[0][1])/2)+ "px",
			opacity: 1
		})
		.html(tooltip_html(d))
	
	d3.select("g." + d.abbreviation + " rect").attr("stroke", "orange")
	d3.select("g." + d.abbreviation + " text.bar")
		.text(string_formatter(d.data[selected_mode]["array"][quarters_array[slider_index]], selected_mode))
		.attr("fill", "black")
}

function clear_tooltip(){
	tooltip.style("opacity", 0);
}

function show_text_for_US(){
	d3.select("h1#state").text("US")
	switching_titles(selected_mode);
	switching_number_labels(us_data, selected_mode)
}

function clear_state(state_node, d ,i) {
	d3.select("g.state_g." + d.abbreviation + " path").attr("stroke", "#CCC")
	d3.select("g." + d.abbreviation + " rect").attr("stroke", "none")
	d3.select("g." + d.abbreviation + " text.bar").text("").attr("fill", "black")
	clear_tooltip();
	show_text_for_US();	
}

function mouseover_state(d,i) {
	highlight_state(d3.select(this), d, i)
}

function mouseout_state(d,i) {
	if(selected_states.indexOf(d.abbreviation) === -1){
		clear_state(d3.select(this), d, i)
	}else{
		clear_tooltip();
		show_text_for_US();
	}
}

function change_inset_header(){
	switch(selected_mode){
		case "fares": return "Avg Fare:";
		
		case "tickets": return "Ticket Volume:";
		
		case "yoy": return "YOY:"
	}
}

function add_text_for_selection(state){	
	console.log(state)
	// d3.select(".inset." + state.abbreviation)
	// 	.append("h4")
	// 	.attr("class", "state_name " + state.abbreviation)
	// 	.text(state.properties.name)
	// 	.style({"position":"absolute", "left":"10px", "top":"70px"})
	
	d3.select(".inset." + state.abbreviation)
		.append("h2")
		.attr("class", "label " + state.abbreviation)
		.text(change_inset_header())
		.style({"font-size": "12px", "position":"absolute", "left": "79px"})
		
	d3.select(".inset." + state.abbreviation)
		.datum(state)
		.append("h2")
		.attr("class", "number_label " + state.abbreviation)
		.text(function(d){ return string_formatter(d.data[selected_mode]["array"][quarters_array[slider_index]], selected_mode); })
		.style({"font-size": "12px", "position":"absolute", "left":"79px", "top":"15px"})

}

function add_selected_time_series(abbreviation){
 	var time_inset = d3.select(".inset." + abbreviation)
		.append("svg")
		.attr("class","inset_time " + abbreviation)
		.attr({width: ts_inset_width, height: 107})
		
	var g = time_inset.append("g")
	var datum = d3.select("g."+abbreviation).datum()
	g.append("path")
		.datum(datum)
		.attr("class", "path_inset " + abbreviation)
		.attr("d", function(d) { 
			console.log(d)
			inset_scale = d.data[selected_mode]["scale"]
			return ts_inset_path(d3.entries(d.data[selected_mode]["array"])) 
		}) 
		.attr("stroke", "#003e5f")
		.attr("stroke-opacity",1)
		.attr("fill", "none")
		
	g.append("circle").attr("class", "inset_time_marker " + abbreviation) 
	g.select("circle.inset_time_marker." + abbreviation)
			.datum(datum)
			.attr("fill", "#003e5f")
			.attr("fill-opacity", 1)
			.attr("r", 3)
			.attr('cx', function(d) { return inset_time_scale(quarters_array[slider_index]) } )
			.attr("cy", function(d) { return d.data[selected_mode]["scale"](d.data[selected_mode]["array"][quarters_array[slider_index]]) })
	
}


function add_selected_state(abbreviation, state){
	var g
	
	zoom = d3.behavior.zoom()
	    .translate([0, 0])
	    .scale(1)
	    .scaleExtent([1, 40])
	    .on("zoom", function() {
			g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
		});
	
	
	selected_states.push(abbreviation)
	
	var inset = d3.select("#interactive_area")
		.append("div")
		.attr("class", "inset " + abbreviation)
		.append("svg")
		.attr("class", "inset_svg " + abbreviation)
		.attr({width: inset_width, height: inset_height})
		
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
	
	add_selected_time_series(abbreviation)
	add_text_for_selection(state)
	
}

function click_on_state(d,i){

	if(selected_states.indexOf(d.abbreviation) === -1){
		highlight_state(d3.select(this), d, i)
		add_selected_state(d.abbreviation, d);
		d3.select("g.bar_g." + d.abbreviation + " text.bar").attr("class", "bar selected")
	}else{
		clear_state(d3.select(this), d, i)
		remove_selected(d.abbreviation);
	}
}

function remove_selected(abbreviation){
	selected_states.splice(selected_states.indexOf(abbreviation),1)
	d3.select(".inset." + abbreviation).remove();
	d3.select("g.bar_g." + abbreviation + "text.bar").attr("class", "bar")
}


function text_price_fill(d,i) {
	if (["VT", "NH", "MA", "RI", "CT", "DE", "MD", "HI"].indexOf(d.abbreviation) > -1)
		return "#222"
		
	if(selected_mode !== "yoy"){
	 	if (d.data[selected_mode]["array"][quarters_array[slider_index]] < 550)
			return "#222"
		else 
			return "#d9e3e3"
	}else if(selected_mode === "yoy"){
		if(d.data[selected_mode]["array"][quarters_array[slider_index]] < 10)
			return "#222"
		else
			return "#d9e3e3"
	}
		
}

var other_states = {
	"Vermont" :			{"x-text offset":-20, "y-text offset":-50, "x1":"570px", "y1":"50px",  "x2":"585px", "y2":"90px" },
	"New Hampshire" :	{"x-text offset":70,  "y-text offset":5,   "x1":"600px", "y1":"102px", "x2":"650px", "y2":"102px"},
	"Massachusetts" :	{"x-text offset":70,  "y-text offset":5,   "x1":"600px", "y1":"115px", "x2":"650px", "y2":"115px"},
	"Rhode Island" :	{"x-text offset":60,  "y-text offset":20,  "x1":"605px", "y1":"125px", "x2":"650px", "y2":"140px"},
	"Connecticut" :		{"x-text offset":60,  "y-text offset":30,  "x1":"590px", "y1":"127px", "x2":"640px", "y2":"150px"},
	"Delaware" :		{"x-text offset":75,  "y-text offset":5,   "x1":"580px", "y1":"175px", "x2":"640px", "y2":"175px"},
	"Maryland" :		{"x-text offset":94,  "y-text offset":15,  "x1":"580px", "y1":"185px", "x2":"640px", "y2":"185px"} 
};

function create_states(states){
	var g = svg.selectAll("g.state_g")
		.data(states)
		.enter()
		.append("g")
		.attr("class", function(d) { return "state_g " + d.abbreviation;})
	
	g.append("path")
		.attr("class", function(d) { return "state " + d.properties.name + " " + d.abbreviation;;})
		.attr("fill", function(d){ 
			if (d.data["fares"])
				return color(d.data["fares"]["array"][column_name]); 
			else
				console.log(d.abbreviation)
		})
		.attr("stroke", "#CCC")
		.attr("d",path)
		.on("mouseover", mouseover_state)
		.on("mouseout", mouseout_state)
		.on("click", click_on_state)
			
	g.append("text")
		.attr("class", function(d) { return "state " + d.properties.name })
		.text(function(d){ return "$" + d.data["fares"]["array"][column_name]; })
		.attr("text-anchor", "middle")
		.attr("font-size", "10px")
		.attr("fill", text_price_fill)
	    .attr("x", function(d) {
			return other_states[d.properties.name] !== undefined ?  path.centroid(d)[0] + other_states[d.properties.name]["x-text offset"] : path.centroid(d)[0];
	    })
	    .attr("y", function(d) {
			return other_states[d.properties.name] !== undefined ?  path.centroid(d)[1] + other_states[d.properties.name]["y-text offset"] : path.centroid(d)[1];
	    })
}

function create_label_lines(){
	svg.selectAll("line.states")
		.data(d3.entries(other_states))
		.enter()
		.append("line")
		.attr("class", function(d){ return d.key })
		.attr("x1", function(d){ return d.value["x1"] })
		.attr("y1", function(d){ return d.value["y1"] })
		.attr("x2", function(d){ return d.value["x2"] })
		.attr("y2", function(d){ return d.value["y2"] })
		.attr("stroke", "black")
}

function create_bars(states){
	var state_names = [];
	states.forEach(function(d){ 
		state_names.push(d.properties.name)
	})
	state_names.sort()
	state_names = sum_of_tickets_array.map(function(d){
		return d.state;
	})
	var x = d3.scale.ordinal().domain(state_names).rangeRoundBands([0, ts_width], 0.5, 0.1)
	bar_height_scale.domain([0, price_max]).range([5, yoy_height])
 	var g = bar_svg.selectAll("g")
				.data(states)
				.enter()
				.append("g")
				.attr("class", function(d){ return "bar_g " + d.abbreviation})
				.attr("transform", function(d) { return "translate("  + (x(d.abbreviation)) + ",0)"})
	
	g.append("rect")
		.attr("width", x.rangeBand())
		.attr("height", function(d){ return bar_height_scale(d.data["fares"]["array"][column_name])})
		.attr("y", function(d){ return (yoy_height - 1) - bar_height_scale(d.data["fares"]["array"][column_name]) - 15})
		.attr("fill", function(d){ return color(d.data["fares"]["array"][column_name])})
		.on("mouseover", mouseover_state)
		.on("mouseout", mouseout_state)
		.on("click", click_on_state)
				
	g.append("text")
		.attr("class", "bar_state")
		.attr("transform", function(d){
			return "translate(0," + (yoy_height - 2) + ")"
		})
		.style("font-size", "7px")
		.text(function(d){ return d.abbreviation})
		.attr("fill", "black")
	
	g.append("text")
		.attr("transform", function(d){
			return "translate(0," + ((yoy_height - 1) - bar_height_scale(d.data["fares"]["array"][column_name]) - 40) + ")"
		})
		.attr("class", "bar")
		.style("font-size", "8px")
}

function initial_draw_map(data){

	d3.json("us-states.json",function(states){
		states.features.pop()
		d3.json("states.json",function(abbrev){
			
			add_data_to_state_features(abbrev, states.features);
			states.features = states.features
				.filter(function(d) { 
					var exclude = ["DC", "HI"]; 
					return exclude.indexOf(d.abbreviation) === -1 
				})
			create_states(states.features);
			create_label_lines();
			create_bars(states.features)
		});
		
	});
	
	d3.select("#slider").append("h3").attr("class","year").text([column_name]);
	show_text_for_US();
	
}


function display_year_and_avg_us_fare(value){
	var text = d3.select(".d3-slider-handle").style("bottom").split("px");
	d3.select("#slider h3.year").text(quarters_array[value]).style("bottom", (parseInt(text[0]) + 40) + "px");
	show_text_for_US()
}

function draw_year(evt, s_index) {
	slider_index = s_index
	display_year_and_avg_us_fare(slider_index);

	d3.selectAll("path.state")
 		.attr("fill", function(d){return color(d.data[selected_mode]["array"][quarters_array[slider_index]]); })
		.on("mouseover", mouseover_state)
		.on("mouseout", mouseout_state)

	d3.selectAll("text.state")
		.text(function(d){ return string_formatter(d.data[selected_mode]["array"][quarters_array[slider_index]], selected_mode)})
		.attr("fill", text_price_fill)

	d3.selectAll("text.bar.selected")
		.text(function(d){ return string_formatter(d.data[selected_mode]["array"][quarters_array[slider_index]], selected_mode)})
	
	d3.selectAll("circle.inset_time_marker")
		.attr("cx", function(d) { return inset_time_scale(quarters_array[slider_index]) })
		.attr("cy", function(d) { return d.data[selected_mode]["scale"](d.data[selected_mode]["array"][quarters_array[slider_index]]) })
	
	d3.selectAll("h2.label")
		.text(change_inset_header())
		
	d3.selectAll("h2.number_label")
		.text(function(d){ return string_formatter(d.data[selected_mode]["array"][quarters_array[slider_index]], selected_mode);})
		
	d3.selectAll("path.path_inset")
		.transition()
		.attr("d", function(d){ 
			inset_scale = d.data[selected_mode]["scale"]; 
			return ts_inset_path(d3.entries(d.data[selected_mode]["array"])) 
		})
	
	d3.selectAll("rect")
		.transition()	
		.attr("height", function(d){ return bar_height_scale(d.data[selected_mode]["array"][quarters_array[slider_index]])})
		.attr("y", function(d){ return (yoy_height - 1) - bar_height_scale(d.data[selected_mode]["array"][quarters_array[slider_index]]) - 15})
		.attr("fill", function(d){ return color(d.data[selected_mode]["array"][quarters_array[slider_index]])})
}

function create_slider(data){
	slider = d3.select("#slider").append("div").attr("class", "slider")	
	slider.call(
		d3.slider()
			.min(0)
			.max(quarters_array.length-1)
			.value(0)
			.step(1)
			.orientation("horizontal")
			.on("slide", draw_year)
		);
}


function get_median_of_prices(){
	overall_median_price = d3.median(all_prices)
}

function add_data_to_state_features(abbrev, states){
	var state_lookup = d3.nest().key(function(d) { return d.state }).map(all_states_data)
	var abbrev_lookup = d3.nest().key(function(d) { return d.name }).map(abbrev)
	states.forEach(function(d,i,array) {
		d.abbreviation = abbrev_lookup[d.properties.name][0].abbreviation
		d.data = state_lookup[d.abbreviation] ? state_lookup[d.abbreviation][0] : {} //map has DC and HI which are not in array
	})
	
}

function get_quarterly_values(nest_result, mode) {
	if (!nest_result) return {}
	var csv_row = nest_result[0]
	delete csv_row.State
	d3.keys(csv_row).forEach(function(q) { 
		if(mode === "yoy"){
			return csv_row[q] = +csv_row[q] * 100 
		}else{
			return csv_row[q] = +csv_row[q] 
		}
	})
	return csv_row
}

function get_sum_of_tickets(){
	all_states_data.forEach(function(d){
		sum_of_tickets_array.push({state: d["state"], ticket_sum: d3.sum(d3.values(d["tickets"]["array"]), function(d){ return d;})})
	})
	sum_of_tickets_array.sort(function(a,b){ return a.ticket_sum - b.ticket_sum})
}

function load_data_object(results) {

	var ticket_data = d3.nest().key(function(d) { return d.State }).map(results[0])
	var fare_data = d3.nest().key(function(d) { return d.State }).map(results[2])
	var yoy_data = d3.nest().key(function(d) { return d.State }).map(results[1])
	var all_prices = []
	var all_tickets = []
	var all_yoy = []
	
	all_states_data = d3.keys(ticket_data)
		.filter(function(d) { var exclude = ["DC", "", "PR"]; return exclude.indexOf(d) === -1 })
		.map(function(state) {
			var fares_array = get_quarterly_values(fare_data[state], "fares")
			var ticket_array = get_quarterly_values(ticket_data[state], "tickets")
			var yoy_array = get_quarterly_values(yoy_data[state], "yoy")
			all_prices = all_prices.concat(d3.values(fares_array))
			all_tickets = all_tickets.concat(d3.values(ticket_array))
			all_yoy = all_yoy.concat(d3.values(yoy_array))
			var price_min = d3.min(d3.values(fares_array))
			var price_max = d3.max(d3.values(fares_array))
			var ticket_min = d3.min(d3.values(ticket_array))
			var ticket_max = d3.max(d3.values(ticket_array))
			var yoy_min = d3.min(d3.values(yoy_array))
			var yoy_max = d3.max(d3.values(yoy_array))
			return {
				state: state,
				tickets: {array: ticket_array, scale: d3.scale.linear().range([ts_inset_height, 0]).domain([ticket_min, ticket_max]) },
				fares: {array: fares_array, scale: d3.scale.linear().range([ts_inset_height, 0]).domain([price_min, price_max]) },
				yoy: {array: yoy_array, scale:  d3.scale.linear().range([ts_inset_height, 0]).domain([yoy_min, yoy_max]) }
			}
		})
		
	us_data = all_states_data.splice(49,1)[0]
	quarters_array = d3.keys(us_data.fares.array)

	price_quantiles = d3.scale.quantile().domain(all_prices.sort()).range([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19])
	yoy_quantiles = d3.scale.quantile().domain(all_yoy.sort()).range([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19])
	
	color.domain([200, price_quantiles.quantiles()[18]])
		  .range(["#fffcf7","rgb(25, 102, 127)"])//, "white", "orange"])
		  .interpolate()
		
	price_max = d3.max(all_prices)
	ticket_max = d3.max(all_tickets)
	yoy_min = d3.min(all_yoy)
	yoy_max = d3.max(all_yoy)
	// inset_scale = d3.scale.linear().range([ts_inset_height, 0]).domain([price_min, price_max])

}

function change_scale(){
	if(selected_mode === "fares"){
		color.domain([200, price_quantiles.quantiles()[18]])
			  .range(["#fffcf7","rgb(25, 102, 127)"])//, "white", "orange"])
			  .interpolate()
		bar_height_scale.domain([0, price_max])
	}else if(selected_mode === "tickets"){
		color.domain([0, 1000, 5000, ticket_max])
			  .range(["#fffcf7", "#6a9ba9", "rgb(25, 102, 127)", "blue"])//, "white", "orange"])
			  .interpolate()
		bar_height_scale.domain([0, ticket_max])
	}else if(selected_mode === "yoy"){
		color.domain([yoy_min, 0, yoy_quantiles.quantiles()[18], 50, 100, yoy_max])
			.range(["#fffcf7","#6a9ba9", "rgb(25, 102, 127)", "#155469", "#0D333F","blue"])//, "white", "orange"])
			  .interpolate()
	}
}

function switching_titles(mode){
	if(mode === "fares"){
		d3.select("#title_primary").text(data_states["fares"]["desc"])	
		d3.select("#title_secondary_one").text(data_states["tickets"]["desc"])	
		d3.select("#title_secondary_two").text(data_states["yoy"]["desc"])		
	}else if(mode === "tickets"){
		d3.select("#title_primary").text(data_states["tickets"]["desc"])
		d3.select("#title_secondary_one").text(data_states["yoy"]["desc"])
		d3.select("#title_secondary_two").text(data_states["fares"]["desc"])
	}else if(mode === "yoy"){
		d3.select("#title_primary").text(data_states["yoy"]["desc"])
		d3.select("#title_secondary_one").text(data_states["fares"]["desc"])
		d3.select("#title_secondary_two").text(data_states["tickets"]["desc"])
	}
}

function switching_number_labels(data, mode){
	if(mode === "fares"){
		d3.select(".primary").text(string_formatter(Math.round(data["fares"]["array"][quarters_array[slider_index]]), "fares"))
		d3.select(".secondary_one").text(string_formatter(Math.round(data["tickets"]["array"][quarters_array[slider_index]]), "tickets"))
		d3.select(".secondary_two").text(string_formatter(Math.round(data["yoy"]["array"][quarters_array[slider_index]]), "yoy"))
	}else if(mode === "tickets"){
		d3.select(".primary").text(string_formatter(Math.round(data["tickets"]["array"][quarters_array[slider_index]]), "tickets"))
		d3.select(".secondary_one").text(string_formatter(Math.round(data["yoy"]["array"][quarters_array[slider_index]]), "yoy"))
		d3.select(".secondary_two").text(string_formatter(Math.round(data["fares"]["array"][quarters_array[slider_index]]), "fares"))
	}else if(mode === "yoy"){
		d3.select(".primary").text(string_formatter(Math.round(data["yoy"]["array"][quarters_array[slider_index]]), "yoy"))
		d3.select(".secondary_one").text(string_formatter(Math.round(data["fares"]["array"][quarters_array[slider_index]]), "fares"))
		d3.select(".secondary_two").text(string_formatter(Math.round(data["tickets"]["array"][quarters_array[slider_index]]), "tickets"))
	}
}

function change_modes(target_mode){
	selected_mode = target_mode;
	change_scale();
	draw_year(null, slider_index);
}

function change_sorts(target_sort){
	selected_sort = target_sort;
	if(target_sort === "alphabetical"){
		
	}
}

var q = queue()
q.defer(d3.csv, "total_pass_state.csv")
q.defer(d3.csv, "fare_median_pchya.csv")
q.defer(d3.csv, "fare_medians_state.csv")
q.awaitAll(function(error, results){
	load_data_object(results)
	get_sum_of_tickets();
	initial_draw_map(results[2]);
	create_slider(results[2]); 
	inset_time_scale = d3.scale.ordinal().domain(quarters_array).rangePoints([0 + ts_left, ts_inset_width - ts_right])	
	d3.select("#modes").selectAll("a").data(["fares","tickets", "yoy"]).on("click", function(d){
		change_modes(d);
	})
	d3.select("#sorts").selectAll("a").data(["alphabetical", "number_of_tickets", "avg_fare", "avg_yoy"]).on("click", function(d){
		change_sorts(d);
	})
})
