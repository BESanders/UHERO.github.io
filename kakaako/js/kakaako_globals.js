var page_width = d3.select("#interactive_area").node().offsetWidth
    map_width = 700,
    map_height = 500,
	controls_height = 70,
	data_height = 150,
	map_scales_height = map_height+data_height,
	map_scales_width = page_width - map_width - 20,
	map_svg_top = 50,
	map_svg_bottom = 20,
	map_svg_height = (map_scales_height / 3) - map_svg_top - map_svg_bottom,
	map_svg_width = 200
;

var ct_data;
