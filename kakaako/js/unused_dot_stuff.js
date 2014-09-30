
//I think the generated dots were 1/100 units
// add_dot_density_to("state", "Total_units", 300, .3)
// add_dot_density_to("county", "Total_units", 200, .05)
// add_dot_density_to("tract", "Total_units", 100, .03)


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