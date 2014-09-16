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

var page_width = d3.select("#interactive_area").node().offsetWidth
    map_width = 700,
    map_height = 500,
	controls_height = 70,
	data_height = 150,
	map_scales_height = map_height+data_height
	
d3.select("#major_controls").style({ height: controls_height+"px", width:page_width+"px", left:"0px", top:"0px" })
d3.select("#map_container").style({ height: map_height+"px", width: map_width+"px", left:"0px", top: controls_height+"px"})
d3.select("#tract_data").style({ height: data_height+"px", width: map_width+"px", left:"0px", top:(map_height+controls_height)+"px" })
d3.select("#map_scales").style({ height: map_scales_height+"px", width:(page_width - map_width)+"px", left:map_width+"px", top:controls_height+"px"})

d3.selectAll("#map_scales div").style({height: (map_scales_height/3)+"px"})

var map = L.map('map_container').setView([21.2990, -157.8537], 16);

		//L.tileLayer.grayscale('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
		L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
	
			maxZoom: 18,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
			id: 'examples.map-i86knfo3'
		}).addTo(map);



var q = queue()
//q.defer(d3.csv, "data/fare_medians_state.csv")
q.awaitAll(function(error, results){

})

console.log(d3.select("#interactive_area").node().offsetWidth)