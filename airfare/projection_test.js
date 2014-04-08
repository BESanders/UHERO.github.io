/**
 * Poverty Chart covering ACS 5yr Estimates of Economic Characteristics by Census Tracts for Hawaii
 * UHERO Visioneering 2014
 */


	// .center([0, 18.5])
	// .rotate([157.50, -1.5])
	// .parallels([15, 25])
	// .scale(8000)
	// .translate([width / 2, height / 2]);
	
var params = {
	center_lat: -10,
	center_lon: 21, 
	rotate_lat: 150.0,
	rotate_lon: 0,
	scale: 8000,
	translate_x: 0,
	translate_y: 0,
	data: {}

}

var dat_gui_ranges = {
	center_lat: [-10.0, 10.0],
	center_lon: [15.0, 22.0], 
	rotate_lat: [-150.0, 165.0],
	rotate_lon: [-5.0, 5.0],
	scale:[8000, 45000],
	translate_x: [0, 800],
	translate_y: [0, 800],	
}
var gui = new dat.GUI();

d3.entries(dat_gui_ranges).forEach(function(elem) { 
	var attr = elem.key;
	var range = elem.value;
	gui.add(params, attr, range[0], range[1]).onChange(draw);
} );

var width = 1000,//642 * .71,
    height = 660;//480 * .71;



var svg = d3.select("body").append("svg").attr({
        class: "map",
        width: width,
        height: height
 })
.style("border", "1px dashed #AAA")
;



function draw_data(hawaii) {
	params.data = hawaii;
	
	var projection = d3.geo.albers()
		.center([params.center_lat, params.center_lon])
		.rotate([params.rotate_lat, params.rotate_lon])
		.scale(params.scale)
		.translate([params.translate_x, params.translate_y]);

	var path = d3.geo.path()
	    .projection(projection);
	
	hawaii_map_data = topojson.feature(hawaii, hawaii.objects.hi_ct).features;

    // load the map
    var districts = svg.selectAll("path.district").data(hawaii_map_data);
        
	districts
		.enter()
		.append("path")
		.attr("fill", "black")
		.attr("class", "district");

	districts.attr("d", path)
}

function draw() {
	draw_data(params.data)
}

d3.json("hi_ct_topo.json", draw_data);





