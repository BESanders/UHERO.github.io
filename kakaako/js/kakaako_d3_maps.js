

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

var dot_positions = []
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

function add_dot_positions_to(map, dot_positions, r) {
  nested_dots = d3.nest().key(function(d) { return d[0] }).entries(dot_positions)
  
  var tract_gs = maps[map].select("g")
    .selectAll("g.tract")
    .data(nested_dots)
    .enter()
    .append("g")
    .attr("class", function(d) { return "tract t"+tag_valid(d.key)})
    
  var dots = tract_gs
    .selectAll("circle.t")
    .data(function(d) { return d.values })
    .enter()
    .append("circle")
    .attr("class", "t")
    .attr("cx", function(d) { return d[1] })
    .attr("cy", function(d) { return d[2] })
    .attr("r", r)
}
function draw_d3_maps(results) {
  var hawaii_geo_json = results[0]
  dot_positions = results[1].positions //comment out if need to regenerate dots
	set_up_map_scale_svgs()
	hawaii_map_data = topojson.feature(hawaii_geo_json, hawaii_geo_json.objects.hi_census_tracts).features;
	hawaii_map_data.forEach(function(d) { 
	  d.data = ct_data.filter(function(e) { return e.Tract === d.properties.NAME })[0] 
	})
	
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

  add_dot_positions_to("state", dot_positions, .1)
  add_dot_positions_to("county", dot_positions, .03)
  add_dot_positions_to("tract", dot_positions, .01)



	
	//I think the generated dots were 1/100 units
	// add_dot_density_to("state", "Total_units", 300, .3)
	// add_dot_density_to("county", "Total_units", 200, .05)
	// add_dot_density_to("tract", "Total_units", 100, .03)
}

function set_county(county) { 
  update_county_text(county)
  zoom_g_to_county("county", county.split(" ")[0].toLowerCase()) 
}

function zoom_g_to_county(map_name, county) {
	c = county_bounds[county]
	maps[map_name].select("g")
	  .transition()
	  .duration(750)
	  .attr("transform", "translate(" + [c.x,c.y] + ")scale(" + c.scale + ")")
	
	maps[map_name].selectAll("circle")
	  .attr("r",1 / Math.pow(c.scale,.5) * .1)
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function add_point_in_bounds(map, tract,id, d, bounds, attempts, dot_r) {
	//put a limit on attempts to prevent infinite loop
	for (var i = 0; i < attempts; i++) {
		x = parseFloat(getRandomArbitrary(bounds[0][0], bounds[1][0]).toFixed(4))
		y = parseFloat(getRandomArbitrary(bounds[0][1], bounds[1][1]).toFixed(4))	
		if (Raphael.isPointInsidePath(d,x,y)) {
			maps[map].select("g").append("circle").attr({cx:x, cy:y, r:dot_r, fill:"red"})	
			dot_positions.push({tract:id, x:x, y:y})
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
			add_point_in_bounds(map, tract, tract_id, d, bounds, 30, dot_r)
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
	q.awaitAll(function(errors,d) { 
	  d3.select("#output")
	    .selectAll("span")
	    .data(dot_positions)
	    .enter()
	    .append("span")
      .text(function(d) { return "[\"" + d.tract + "\", " + d.x + ", " + d.y + " ]," })
	    
	})
}


//assuming 50 units per dot...guess, but I think that's right
function dots_for_prop(tract_d, prop) {
  if (!tract_d.data) {
    console.log("no data for feature: "+tract_d.properties.NAME)
  }
  else {
    var id = tract_d.data.Tract
    var num_dots = Math.round(+tract_d.data[prop] / 50)
    var dots = d3.selectAll("g.t"+tag_valid(id)).selectAll("circle:nth-of-type(-n+"+num_dots+")")
    dots.classed(prop, true)
  }
}

function set_maps_to_prop(prop) {
  d3.selectAll("circle.t").attr("class", "t")
  d3.selectAll("path.tract").each(function(d) { dots_for_prop(d, prop) })
}

function zoom_to_tract_id(id) {
	var tract = d3.select("#tract_"+tag_valid(id))
	d = tract.datum()
	set_county(d.data.County)
	bounds = geo_path.bounds(d)
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
	    
  	maps["tract"].selectAll("circle")
  	  .attr("r",1 / Math.pow(scale,.5) * .1)
  	
  	return d.data
}

function highlight_tract_path(id) {
  
}

function highlight_tract(id) {
  //does bars (rect), path (tract shapes), g (dot containers)
  d3.selectAll(".tract").classed("selected", false)
	d3.selectAll(".t"+tag_valid(id)).classed("selected",true)	
}

function update_all_text() {
  update_tract_text(curr_tract_d)
	update_county_text(curr_tract_d.County)
	update_statewide_text()
}

function update_tract_text(d) {
  prop_string = curr_prop ? d[curr_prop] : ""
  d3.select("#tract_map .unit_info").text("Tract # "+d.Tract+": "+prop_string+" / "+d.Total_units+" units")
}

function update_county_text(county) {
  var d = sum_data[county]
  prop_string = curr_prop ? d[curr_prop] : ""
  d3.select("#county_map .unit_info").text(county+": "+prop_string+" / "+d.Total_units+" units")  
}

function update_statewide_text() {
  var d = sum_data["Statewide"]
  prop_string = curr_prop ? d[curr_prop] : ""
  d3.select("#state_map .unit_info").text("Statewide: "+prop_string+" / "+d.Total_units+" units")  
}
function select_tract_id(id) {
  var d = zoom_to_tract_id(id)
  curr_tract_d = d
  update_tract_text(d)
  highlight_tract(id)
}