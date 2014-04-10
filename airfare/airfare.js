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
    height = 400;//860

var svg = d3.select("#map").attr({
			width: width,
			height: height
})

var projection = d3.geo.albersUsa()
					.translate([350,200])
					.scale([800])

var path = d3.geo.path()
			.projection(projection);
			
var color = d3.scale.linear();
var numbers = [];

function initial_draw_map(column_name, data){
	var airfares = {};
	data.forEach(function(d){
		airfares[d.State] = d
		numbers = numbers.concat(d3.values(d).filter(function(d){
						return !isNaN(d) && d !== "";
					}))
	})

	for(var i = 0; i < numbers.length; i++){
		numbers[i] = +numbers[i];
	}

	numbers.sort(function(a,b){ return a - b;})
	color.domain([d3.min(numbers, function(d){ return d;}), d3.max(numbers, function(d){ return d;})])
		  .range(["rgb(222,235,247)", "rgb(8,48,107)"])
		  .interpolate()
		//.range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)","rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)"])

	
	d3.json("us-states.json",function(states){
		states.features.pop()
		d3.json("states.json",function(abbrev){
			abbrev.forEach(function(d){
				for(var i = 0; i < states.features.length; i++){
					if(states.features[i].properties.name === d.name){
						states.features[i].properties.abbreviation = d.abbreviation;
					}
				}
			});
			svg.selectAll("path.states")
					.data(states.features)
					.enter()
					.append("path")
					.attr("class", function(d) { return "state " + d.properties.name;})
					.attr("fill", function(d){
						if(d.properties.abbreviation === "HI"){
							return 0;
						}else{
							return color(airfares[d.properties.abbreviation][column_name]);
						}
					})
					.attr("stroke", "#CCC")
					.attr("d",path)
		});
	});
}

function recolor(column_name,data){
	d3.selectAll("path.states")
	
}

/* Added slider*/

d3.csv("Airfares_by_State.csv", function(data){
	initial_draw_map("1993Q1", data)
	$(function(){
		$("#slider").slider({
			min:1,
			max:83,
			slide: function(event, ui){
				recolor(d3.keys(data[0])[ui.value],data);
			}
		});
	});
})

// d3.csv("Airfares_by_State.csv", function(data){
// 	draw_map("1993Q1", data)
// 	d3.select("#interactive_area").selectAll("a")
// 		.data(d3.keys(data[0]))
// 		.enter()
// 		.append("a")
// 		.html(function(d){ 
// 			if(d !== "State"){
// 				if(d.indexOf("Q4") === -1){
// 					return d + " | ";
// 				}else{
// 					return d + "<br/>";
// 				}
// 			}
// 		})
// 		.attr("href", "javascript:;")
// 		.on("click", function(d){
// 			draw_map(d,data);
// 		})
// })