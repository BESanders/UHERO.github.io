function render_leaflet_map() {

	var map = L.map('map_container').setView([21.2990, -157.8537], 16);
	//L.tileLayer.grayscale('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
	L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'examples.map-20v6611k'
	}).addTo(map);
}