var inset_width = 700;
var inset_height = 550;
// --------------------------------- MAGIC ---------------------------------
var county_selected = "STATE"
var county_bounds = {}
var geo_proj = d3.geo.albers()
	.center([0, 18.5])
	.rotate([157.50, -1.5])
	.parallels([15, 25])
	.scale(8000)
	.translate([inset_width / 2, inset_height / 2+80])

var geo_path = d3.geo.path().projection(geo_proj);
zoom = d3.behavior.zoom()
    .translate([0, 0])
    .scale(1)
    .scaleExtent([1, 40])
    .on("zoom", zoomed);


function zoomed() {
	if (d3.event.sourceEvent) { d3.select("#reset_container").style("display", "block")	}
	svg.select("g")
		.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
		
	svg.select("g#zoom_map")
		.selectAll("circle.pos")
		.attr("r",school_r/d3.event.scale)
	
}

function zero_pad(num_string) {
	return num_string.length === 1 ? "0"+num_string : num_string
}

function check_county(d) { 
	var county = d.properties.COUNTY
	if (map_clicked) return;
	if (county_selected !== county) {
		county_selected = county
		zoom_to_bounds(county_bounds[county])
	}
	
} 

function reset(d) {
	map_clicked = true; 
	county_selected = "STATE"
	d3.select("#reset_container").style("display", "none")

	d3.selectAll("path.precinct").attr("fill-opacity", 1)

	svg.transition()
		.duration(750)
		.call(zoom.translate([0, 0]).scale(1).event)
		.each("end", function(d) { 
			map_clicked = false;
		});
	
}

function highlight_precinct_from_this(d, obj) {
	if (map_clicked) return;	
	d3.select(obj).attr("fill-opacity", .1)
}

function highlight_precinct(d) {
	check_county(d)
	highlight_precinct_from_this(d, this)

}

function zoom_to_bounds(bounds) {
	d3.select("#reset_container").style("display", "block")
	var map_clicked_state = map_clicked
	map_clicked = true
	var	  dx = bounds[1][0] - bounds[0][0],
	      dy = bounds[1][1] - bounds[0][1],
	      x = (bounds[0][0] + bounds[1][0]) / 2,
	      y = (bounds[0][1] + bounds[1][1]) / 2,
	      scale = .6 / Math.max(dx / inset_width, dy / inset_height),
	      translate = [inset_width / 2 - scale * x, inset_height / 2 - scale * y];
	
	svg.transition()
	    .duration(750)
	    .call(zoom.translate(translate).scale(scale).event)
		.each("end", function(d) { 
			map_clicked = map_clicked_state 
		});;
	
}

function click_precinct(d) {
	d3.event.stopPropagation()

	if (d3.event.defaultPrevented) { return } 
	
	if (map_clicked) {
		map_clicked = false;
		highlight_precinct_from_this(d,this)
	}

	map_clicked = true
	
	var bounds = geo_path.bounds(d)
	zoom_to_bounds(bounds)
	
}

function county_accessor(d) {
	return d.__data__.properties.COUNTY
}

function precinct_class(d) {
	return "precinct H" + d.properties.State_House + " P" + d.id + " S" + d.properties.State_Senate;
}

function set_up_map() {
	svg = d3.select("#district_map")
		.append("svg")
		.attr("id", "overview_map")
		.attr("width", inset_width)
		.attr("height", inset_height)
		.on("click", reset)
		
	d3.select("#district_map").append("div")
		.attr("id", "reset_container")
		.append("a")
		.attr("id", "reset_button")
		.attr("href", "javascript:;")
		.on("click", reset)
		.text("Reset Map")

	svg.call(zoom).call(zoom.event);
}

function calculate_bounds(paths) {
	counties = ["OAHU", "HAWAII", "KAUAI", "MAUI", "STATE"]
	counties.forEach(function(county) { 
		var included_precincts = paths[0].filter(function(d) { return county_accessor(d) === county})
		var precinct_bounds = included_precincts.map(function(d) { return geo_path.bounds(d.__data__)})
		var left = d3.min(precinct_bounds, function(d) {return d[0][0]}),
			top = d3.min(precinct_bounds, function(d) {return d[0][1]}),
			right = d3.max(precinct_bounds, function(d) {return d[1][0]}),
			bottom = d3.max(precinct_bounds, function(d) {return d[1][1]})

		county_bounds[county] = [[left, top], [right, bottom]]
	})
	
}


// --------------------------------- END MAGIC ---------------------------------

