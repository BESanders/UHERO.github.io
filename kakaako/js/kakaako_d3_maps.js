

// zoom = d3.behavior.zoom()
//     .translate([0, 0])
//     .scale(1)
//     .scaleExtent([1, 40])
//     .on("zoom", zoomed);
// 
// function zoomed() {
// 	maps["county"].select("g").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
// }

var maps = {}

var county_bounds = {
	kauai: {x:-35, y: -68, scale:5.6 },
	honolulu: {x:-666, y: -318, scale:9.1 },
	maui: {x:-448, y: -192, scale:4.22 },
	hawaii: {x:-411, y: -253, scale:3.1 }
}

var projection = d3.geo.albers()
	.center([0, 18.5])
	.rotate([157.5, -1.5])
	.scale(map_svg_width*10)
	.translate([map_svg_width/2, map_svg_height/2+20]);

var geo_path = d3.geo.path()
    .projection(projection);

//works for one period right now
function tag_valid(string) {
	return string.split(".").join("_")
}
function set_up_map_scale_svgs() {
	maps["state"] = d3.select("#state_map svg").attr("width", map_svg_width).attr("height", map_svg_height) 
	maps["county"] = d3.select("#county_map svg").attr("width", map_svg_width).attr("height", map_svg_height)//.call(zoom) 
	maps["tract"] = d3.select("#tract_map svg").attr("width", map_svg_width).attr("height", map_svg_height) 
}

function tract_class(d) {
	return "tract t"+tag_valid(d.properties.NAME)
}
function draw_d3_maps(hawaii_geo_json) {
	console.log(ct_data)
	set_up_map_scale_svgs()
	hawaii_map_data = topojson.feature(hawaii_geo_json, hawaii_geo_json.objects.hi_census_tracts).features;
	hawaii_map_data.forEach(function(d) { d.data = ct_data.filter(function(e) { return e.Tract === d.properties.NAME })[0] })
	console.log(hawaii_map_data)
	
	var tracts = maps["state"]
	    .append("g")
	    .selectAll("path.tract")
		.data(hawaii_map_data)
		.enter()
		.append("path")
		.attr("id", function(d) { return "state_"+tag_valid(d.properties.NAME)})
		.attr("class", tract_class)
		.attr("d", geo_path)

	var tracts_c = maps["county"]
		.append("g")
		.selectAll("path.tract")
		.data(hawaii_map_data)
		.enter()
		.append("path")
		.attr("id", function(d) { return "county_"+tag_valid(d.properties.NAME)})
		.attr("class", tract_class)
		.attr("d", geo_path)

	var tracts_t = maps["tract"]
		.append("g")
		.selectAll("path.tract")
		.data(hawaii_map_data)
		.enter()
		.append("path")
		.attr("id", function(d) { return "tract_"+tag_valid(d.properties.NAME)})
		.attr("class", tract_class)
		.attr("d", geo_path)
	
	set_county("honolulu")
	zoom_to_tract_id("89.22")
	// add_dot_density_to("state", "Total_units", 300, .3)
	// add_dot_density_to("county", "Total_units", 200, .05)
	// add_dot_density_to("tract", "Total_units", 100, .03)
}

function set_county(county) { zoom_g_to_county("county", county) }
function zoom_g_to_county(map_name, county) {
	c = county_bounds[county]
	maps[map_name].select("g").transition().duration(750).attr("transform", "translate(" + [c.x,c.y] + ")scale(" + c.scale + ")")
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function add_point_in_bounds(map, tract, d, bounds, attempts, dot_r) {
	//put a limit on attempts to prevent infinite loop
	for (var i = 0; i < attempts; i++) {
		x = parseFloat(getRandomArbitrary(bounds[0][0], bounds[1][0]).toFixed(4))
		y = parseFloat(getRandomArbitrary(bounds[0][1], bounds[1][1]).toFixed(4))	
		if (Raphael.isPointInsidePath(d,x,y)) {
			maps[map].select("g").append("circle").attr({cx:x, cy:y, r:dot_r, fill:"red"})	
			return true
		}
	}
	console.log("could not find a point inside for "+ tract.datum().properties.NAME+" in "+attempts+" attempts")
	return true
	
}
function add_points_in_bounds(map, tract_id, num_points, dot_r, callback) {
	setTimeout(function() {
		var tract = d3.select("#"+map+"_"+tag_valid(tract_id))
		bounds = geo_path.bounds(tract.datum())
		d = tract.attr("d")
		for (var i = 0; i < num_points; i++)
			add_point_in_bounds(map, tract, d, bounds, 10, dot_r)
		callback(null, num_points)
	}, 0)
}
function add_dot_density_to(map, col, dot_scale, dot_r) {
	var q = queue(1)
	d3.selectAll("#"+map+"_map .tract")
		.data()
		.forEach(function(d) { 
			if (d.data)
				// add_points_in_bounds(map, d.data.Tract, Math.round(d.data[col] / dot_scale), dot_r) 
				q.defer(add_points_in_bounds, map, d.data.Tract, Math.round(d.data[col] / dot_scale), dot_r) 
			else
				console.log("no data for " + d.properties.NAME)
		})
	q.awaitAll(function(errors,d) { console.log(d) })
}
function zoom_to_tract_id(id) {
	var tract = d3.select("#tract_"+tag_valid(id))
	
	d3.selectAll(".tract").classed("selected", false)
	d3.selectAll(".t"+tag_valid(id)).classed("selected",true)

	bounds = geo_path.bounds(tract.datum())
	var	  dx = bounds[1][0] - bounds[0][0],
	      dy = bounds[1][1] - bounds[0][1],
	      x = (bounds[0][0] + bounds[1][0]) / 2,
	      y = (bounds[0][1] + bounds[1][1]) / 2,
	      scale = .6 / Math.max(dx / map_svg_width, dy / map_svg_height),
	      translate = [map_svg_width / 2 - scale * x, map_svg_height / 2 - scale * y];
	
	maps["tract"].select("g")
	    .transition()
	    .duration(750)
	    .attr("transform", "translate(" + translate + ")scale(" + scale + ")")
}