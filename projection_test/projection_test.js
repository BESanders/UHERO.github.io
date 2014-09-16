/**
 * Poverty Chart covering ACS 5yr Estimates of Economic Characteristics by Census Tracts for Hawaii
 * UHERO Visioneering 2014
 */
var width = 1000,//642 * .71,
    height = 660;//480 * .71;

	// .center([0, 18.5])
	// .rotate([157.50, -1.5])
	// .parallels([15, 25])
	// .scale(8000)
	// .translate([width / 2, height / 2]);
	
var params = {
	center_lat: 0,
	center_lon: 18.5, 
	rotate_lat: 157.5,
	rotate_lon: -1.5,
	scale: 8000,
	translate_x: width/2,
	translate_y: height/2,
	width: width,
	height: height,
	data: {}
	

}

var dat_gui_ranges = {
	center_lat: [-200.0, -50.0],
	center_lon: [-20.0, 22.0], 
	rotate_lat: [-30.0, 140.0],
	rotate_lon: [-5.0, 5.0],
	scale:[200, 8000],
	translate_x: [0, 800],
	translate_y: [0, 800],	
	width:[0,1000],
	height:[0,800]
}
var gui = new dat.GUI();

d3.entries(dat_gui_ranges).forEach(function(elem) { 
	var attr = elem.key;
	var range = elem.value;
	gui.add(params, attr, range[0], range[1]).onChange(draw);
} );





var svg = d3.select("body").append("svg").attr({
        class: "map",
        width: params.width,
        height: params.height
 })
.style("border", "1px dashed #AAA")
;



function draw_data(hawaii) {
	params.data = hawaii;
	svg.attr("width", params.width).attr("height", params.height)
	
	var projection = d3.geo.albers()
		.center([params.center_lat, params.center_lon])
		.rotate([params.rotate_lat, params.rotate_lon])
		.scale(params.width*8)
		.translate([params.width/2, params.height/2]);
	
	// var projection = d3.geo.albers()
	// 	.center([params.center_lat, params.center_lon])
	// 	.rotate([params.rotate_lat, params.rotate_lon])
	// 	.scale(params.scale)
	// 	.translate([params.translate_x, params.translate_y]);

	var path = d3.geo.path()
	    .projection(projection);
	
	hawaii_map_data = topojson.feature(hawaii, hawaii.objects.doe).features;
//	hawaii_map_data = topojson.feature(hawaii, hawaii.objects.hi_ct).features;

    // load the map
    var districts = svg.selectAll("path.district").data(hawaii_map_data);
        
	districts
		.enter()
		.append("path")
		.attr("fill", "black")
		//.attr("stroke", "black")
		.attr("class", "district");

	districts.attr("d", path)
}

function draw() {
	draw_data(params.data)
}

d3.json("doe_high_smallest.json", draw_data);
//d3.json("doe_simplified.json", draw_data);





