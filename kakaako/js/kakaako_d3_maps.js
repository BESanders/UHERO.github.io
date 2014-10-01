

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

function commas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function set_up_map_scale_svgs() {
	maps["state"] = d3.select("#state_map svg").attr("width", map_svg_width).attr("height", map_svg_height) 
	maps["county"] = d3.select("#county_map svg").attr("width", map_svg_width).attr("height", map_svg_height)//.call(zoom) 
	maps["tract"] = d3.select("#tract_map svg").attr("width", map_svg_width).attr("height", map_svg_height) 
}

function tract_class(d) {
	return "tract t"+d.id
}


function add_dot_counts_to_nested_dots(nested_dots) {
  ct_data.forEach(function(d) { 
    if (nested_dots[+d.Tract]) {
      nested_dots[+d.Tract].forEach(function(e) { e.push("t ") })
      fields.forEach(function(field) {
        var dotcount = Math.round(+d[field] / 50)
        nested_dots[+d.Tract].forEach(function(dot,i) { 
          if (i < dotcount) {
            dot[3] = dot[3]+" "+field
          }
        })
      })
    }
  })
}

function prep_dots(dots_position) {
  nested_dots = d3.nest().key(function(d) { return d[0] }).map(dot_positions)
  add_dot_counts_to_nested_dots(nested_dots);
  nested_dots = d3.entries(nested_dots)
  return nested_dots
}

function dot_class(d) {
  return (typeof d[3] === "undefined") ? "t" : d[3]   //problem with the dots/tracts lining up
}
function add_dot_positions_to(map, dots, r) {
  
  var tract_gs = maps[map].select("g")
    .selectAll("g.tract")
    .data(dots)
    .enter()
    .append("g")
    .attr("class", function(d) { return "tract t"+tag_valid(d.key)})
    
  var dots = tract_gs
    .selectAll("circle.t")
    .data(function(d) { return d.value })
    .enter()
    .append("circle")
    .attr("class", dot_class)
    .attr("cx", function(d) { return d[1] })
    .attr("cy", function(d) { return d[2] })
    .attr("r", r)
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

function set_maps_to_prop(prop) {
  d3.selectAll("circle.t").attr("class", dot_class)
  d3.selectAll("circle.t."+prop).classed("show_"+prop, true)
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
  var tract = d3.selectAll("#state_map path.tract.t"+tag_valid(id))//.style("fill", "red")
  var centroid = geo_path.centroid(tract.datum())
  d3.select(".highlighter").attr("cx", centroid[0]).attr("cy", centroid[1])
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
  update_text("tract_map", d, "Tract #"+d.Tract)
}

function update_county_text(county) {
  update_text("county_map", sum_data[county], county)
}

function update_statewide_text() {
  update_text("state_map", sum_data["Statewide"], "Statewide")
}

function update_text(map_id, d, prefix) {
  prop_string = curr_prop && curr_prop !== "Total_units" ? "out of "+commas(d.Total_units) + " total units": " "
  d3.select("#"+map_id+" .unit_info").html(prefix+": <strong>"+ commas(d[curr_prop]) + "</strong> units")  
  d3.select("#"+map_id+" .context_info").text(prop_string)    
}
function select_tract_id(id) {
  var d = zoom_to_tract_id(id)
  curr_tract_d = d
  update_tract_text(d)
  highlight_tract(id)
  highlight_tract_path(id)
}



function draw_d3_maps(results) {
  var hawaii_geo_json = results[0]
  dot_positions = results[1].positions //comment out if need to regenerate dots
	set_up_map_scale_svgs()
	hawaii_map_data = topojson.feature(hawaii_geo_json, hawaii_geo_json.objects.tracts_final_simplified).features;
	hawaii_map_data.forEach(function(d) { 
    d.data = ct_data.filter(function(e) { return e.tract_id === d.id })[0] 
	})
	
	var tracts = maps["state"]
	    .append("g")
	    .selectAll("path.tract")
		.data(hawaii_map_data)
		.enter()
		.append("path")
		.attr("id", function(d) { return "state_"+d.id})
		.attr("class", tract_class)
		.attr("d", geo_path)

	var tracts_c = maps["county"]
		.append("g")
		.selectAll("path.tract")
		.data(hawaii_map_data)
		.enter()
		.append("path")
		.attr("id", function(d) { return "county_"+d.id})
		.attr("class", tract_class)
		.attr("d", geo_path)

	var tracts_t = maps["tract"]
		.append("g")
		.selectAll("path.tract")
		.data(hawaii_map_data)
		.enter()
		.append("path")
		.attr("id", function(d) { return "tract_"+d.id})
		.attr("class", tract_class)
		.attr("d", geo_path)

  var dots = prep_dots(dot_positions)
  add_dot_positions_to("state", dots, .1)
  add_dot_positions_to("county", dots, .03)
  add_dot_positions_to("tract", dots, .01)
  
  //no zoom, no need to attach to g
  maps["state"].append("circle").attr("class", "highlighter").attr("r",3)

}
