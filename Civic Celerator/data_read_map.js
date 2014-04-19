var map_fill = "gray"
var highlight_fill = "red"


var inset_svg;
var projections_inset;	
var precincts;
var county_selected = "Hawaii County"



function precinct_class(d) {
	var desc = d.id.split("-"); 
	if(desc[0][0] === "0"){
		desc[0] = desc[0].slice(1);
	}
	if(desc[1][0] === "0"){
		desc[1] = desc[1].slice(1);
	}
	console.log(desc)
	var senate = "";
	for(var i = 0; i < precincts.length; i++){
		if(precincts[i]["House"] === desc[0] && precincts[i]["Precinct"] === desc[1]){
			senate = precincts[i]["Senate"]; 					
		}
	}
	d.house = desc[0]
	d.senate = senate
	d.precinct = desc[1]
	return "district H" + desc[0] + " P" + desc[1] + " S" + senate;
}

// function(d) { 
// 	var desc = d.id.split("-"); 
// 	if(desc[0][0] === "0"){
// 		desc[0] = desc[0].slice(1);
// 	}
// 	if(desc[1][0] === "0"){
// 		desc[1] = desc[1].slice(1);
// 	}
// 	var senate = "";
// 	for(var i = 0; i < precincts.length; i++){
// 		if(precincts[i]["House"] === desc[0] && precincts[i]["Precinct"] === desc[1]){
// 			senate = precincts[i]["Senate"]; 
// 		}
// 	}
// 	return "inset H" + desc[0] + " P" + desc[1] + " S" + senate; 
//  })

function draw_map(chamber, district){
	var map_svg = d3.select("#map")
					.append("svg")
					.attr("id", "map")
	
	var map_width = 760//960,
	    map_height = 360//660;

	map_svg.attr("width", map_width)
	    	.attr("height", map_height);
	
	var projection = d3.geo.albers()
		.center([0, 18.5])
		.rotate([159.266, -3.049])
		.parallels([15, 25])
		.scale(5000)
		.translate([287, 90]);
		
	var path = d3.geo.path()
	    .projection(projection);
	
	d3.csv("precincts.csv", function(data){	
		precincts = data; 
		d3.json("hawaii_voting_districts_topo.json", function(error, hawaii) {
				create_inset(topojson.feature(hawaii, hawaii.objects.hawaii_voting_districts).features)
				map_svg.selectAll("path.district")
					.data(topojson.feature(hawaii, hawaii.objects.hawaii_voting_districts).features)
					.enter().append("path")
					.attr("fill", map_fill)
					.attr("stroke", map_fill)
				    .attr("class", precinct_class)
				    .attr("d", path)
				
				highlight_map(chamber, district)
		}) 
	})
}

function create_inset(data){	
	var inset_width = 560,
	 	inset_height = 320;

	inset_svg = d3.select("#map")
						.append("svg")
						.attr("id", "inset")
						.attr("width", inset_width)
						.attr("height", inset_height)
	
	inset_projections = {
		"City and County of Honolulu": d3.geo.albers().center([0, 18.5]).rotate([157.967, -2.941]).scale(29284).translate([308, 139]),
		"Hawaii County": d3.geo.albers().center([0, 18.5]).rotate([155.527, -.99]).scale(11016).translate([355, 159]),
	    "Kauai County": d3.geo.albers().center([0, 18.5]).rotate([159.917, -3.374]).scale(16431).translate([288, 170]),
	    "Maui County": d3.geo.albers().center([0, 18.5]).rotate([156.665, -2.290]).scale(18428).translate([305, 159])
	}
	
	inset_svg.selectAll("path.inset")
			 .data(data)
			 .enter()
			 .append("path")
			.attr("fill", map_fill)
			.attr("stroke", map_fill)
			 .attr("class", precinct_class)
			 .attr("d", d3.geo.path().projection(inset_projections["City and County of Honolulu"]))
			.on("mouseover", function(d,i) { 
				console.log(d)
				console.log(d3.select(this).attr("class"))
				d3.select(this).attr("fill", highlight_fill).attr("stroke", highlight_fill)
			})
			.on("mouseout", function(d,i) { d3.select(this).attr("fill", map_fill).attr("stroke", map_fill)})
			
}

function highlight_map(chamber, district){
 for(var i = 0; i < precincts.length; i++){
	 if(chamber === "House"){
		 if(parseInt(precincts[i][chamber]) === district){
			
			d3.selectAll("path.district.H"+district).attr("fill", highlight_fill).attr("stroke", highlight_fill)
			d3.selectAll("path.inset.H"+district).attr("fill", highlight_fill).attr("stroke", highlight_fill)
			var county = precincts[i]["County"]
			if (county_selected !== county) {
				county_selected = county
				inset_svg.selectAll("path.inset").attr("d", d3.geo.path().projection(inset_projections[county]))
			}
			break;
		 }
	 }
	 if(chamber === "Senate"){
		 if(parseInt(precincts[i][chamber]) === district){
			d3.selectAll("path.district.S"+district).attr("fill", highlight_fill).attr("stroke", highlight_fill)
			d3.selectAll("path.inset.S"+district).attr("fill", highlight_fill).attr("stroke", highlight_fill)
			inset_svg.selectAll("path.inset").attr("d", d3.geo.path().projection(inset_projections[precincts[i]["County"]]))
			break;
		 }
	 }
 }
}





//load_dataset();

draw_map("House", 1)