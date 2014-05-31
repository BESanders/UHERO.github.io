var params = {
	scale:0.5,
	translate_x: -20,
	translate_y: -2,
	data: {}

}

var dat_gui_ranges = {
	scale:[0, 1],
	translate_x: [-800, 800],
	translate_y: [-800, 800],	
}

var gui = new dat.GUI();

d3.entries(dat_gui_ranges).forEach(function(elem) { 
	var attr = elem.key;
	var range = elem.value;
	gui.add(params, attr, range[0], range[1]).onChange(draw);
} );

var width = 1000,//642 * .71,
    height = 400;//480 * .71;

var svg = d3.select("body").append("svg").attr({
        class: "map",
        width: width,
        height: height
 })
.style("border", "1px dashed #AAA")
;

var g = svg.append("g")
	
function format_svg(states){
	var projection = d3.geo.albersUsa()
						.translate([350,200])
						.scale([800])
	
	var path = d3.geo.path()
	    .projection(projection);
	
	g.selectAll("path.states")
				.data(states.features)
				.enter()
				.append("path")
				.attr("class", function(d) { return "state " + d.properties.name + " " + d.properties.abbreviation;;})
				// .attr("fill", function(d){
				// 					if(d.properties.abbreviation === "HI"){
				// 						return 0;
				// 					}else{
				// 						return color(airfares[d.properties.abbreviation][column_name]);
				// 					}
				// 				})
				.attr("stroke", "#CCC")
				.attr("d",path)
	
}

function draw() {
	g.attr("transform", "translate(" + params.translate_x + "," + params.translate_y + ")scale(" + params.scale + ")")
}


d3.json("us-states.json",format_svg);
