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



function size_divs() {
	d3.select("#major_controls").style({ height: controls_height+"px", width:page_width+"px", left:"0px", top:"0px" })
	d3.select("#map_container").style({ height: map_height+"px", width: map_width+"px", left:"0px", top: controls_height+"px"})
    d3.select("#tract_data").style({ height: data_height+"px", width: map_width+"px", left:"0px", top:(map_height+controls_height)+"px" })
	d3.select("#map_scales").style({ height: map_scales_height+"px", width:map_scales_width+"px", right:10+"px", top:controls_height+"px"})
	d3.selectAll("#map_scales div").style({height: (map_scales_height/3)+"px"}).append("svg")
}


// --------------- Run Main instructions ----------------

// var q = queue()
// q.defer(d3.csv, "data/fare_medians_state.csv")
// q.awaitAll(function(error, results){
// 
// })

size_divs()

d3.json("data/map/newbuildings_geojson.geojson", function(json_data) { 
  render_leaflet_map(json_data);
})

d3.csv("data/ct_census_data.csv", function(data) {
	ct_data = data
  var q = queue()
	q.defer(d3.json,"data/map/hi_census_tracts_topo.json")
	q.defer(d3.json,"data/dot_positions.json")
	q.awaitAll(function(error, results ) {
  	draw_d3_maps(results)
	})
})
