var page_width = d3.select("#interactive_area").node().offsetWidth
    map_width = 700,
    map_height = 500,
	controls_height = 50,
	data_height = 150,
	map_scales_height = map_height+data_height,
	map_scales_width = page_width - map_width - 20,
	map_svg_top = 50,
	map_svg_bottom = 20,
	map_svg_height = (map_scales_height / 3) - map_svg_top - map_svg_bottom,
	map_svg_width = 200
;

var ct_data;
var sum_data = {};
var curr_tract_d = null;

var fields = [
  "Total_units", 
  "Renter_occupied", 
  "Owner_occupied", 
  "Vacant", 
  "VALUE_Less299k", 
  "VALUE_300_499k", 
  "VALUE_500_999k", 
  "VALUE_1Mup", 
  "RENT_Less749", 
  "RENT_750_999", 
  "RENT_1k_1499", 
  "RENT_1k5up",
  "BLT_After2010","BLT_2000_2009","BLT_1990_1999","BLT_1980_1989","BLT_1970_1979","BLT_1960_1969","BLT_1950_1959","BLT_1940_1949","BLT_Before1939"
]
