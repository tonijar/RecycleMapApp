// When current location successfully found --> do nothing
function onLocationFound(e) {
}

// When current location fails --> alert message
function onLocationError(e) {
	alert("Error en la geolocalización");
}

// Show map centered at current position.
var map = L.map('map');
// Current location
map.locate({
	setView : true,
	maxZoom : 14
});

// Location control			
L.control.locate({
	position: 'topleft',  // set the location of the control
    drawCircle: true,  // controls whether a circle is drawn that shows the uncertainty about the location
    metric: true,  // use metric or imperial units
    onLocationError: function(err) {alert("Error en la geolocalización")},  // define an error callback function
    title: "Posición actual",  // title of the locat control
    popupText: ["Estás aproximadamente a ", " de aquí"],  // text to appear if user clicks on circle
    setView: true, // automatically sets the map view to the user's location
    locateOptions: {enableHighAccuracy: true}  // define location options e.g enableHighAccuracy: true).addTo(map);
}).addTo(map);

L.tileLayer('http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution : 'Maps by &copy; <a href="http://openstreetmap.org" rel="nofollow" target="_blank">OpenStreetMap<\/a> contributors \
	 <a rel="license" href="http://creativecommons.org/licenses/by-sa/2.0/" rel="nofollow" target="_blank">\
	 <img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-sa/2.0/80x15.png" /><\/a>',
	maxZoom : 14
}).addTo(map);

// Add metric scale
L.control.scale(
	{
		metric : true,
		imperial : false
	}
).addTo(map);

// Fullscreen control
L.control.fullscreen({
  position: 'topright',
  title: 'Mostrar en pantalla completa'
}).addTo(map);

// Location functions
map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);

// Cluster of custom locations
var markers = new L.MarkerClusterGroup();
var geo_csv = {};
map.removeLayer(geo_csv);
geo_csv = L.geoCsv(null, {
	fieldSeparator : ';',
	lineSeparator : '\n',
	deleteDobleQuotes : true,
	firstLineTitles : true,
	onEachFeature : function(feature, layer) {
		var popup = '';
		for (var clave in feature.properties) {
			var title = geo_csv.getPropertyTitle(clave);
			
			if (title == "Nombre") {
				popup += '<b>' + feature.properties[clave] + '<\/b>';
			}
			else if (title == "Web") {
				popup += '<a href="' + feature.properties[clave] + '" rel="nofollow" target="_blank">Web del punto de reciclaje<\/a>';
			}
			else {
				popup += '<b>' + title + ': <\/b>';
				popup += feature.properties[clave];
			}
			popup += '<br\/>';
		}
		layer.bindPopup(popup);
	},
	pointToLayer : function(feature, latlng) {
		var marker = L.marker(latlng, {
			icon : L.icon({
				iconUrl : 'images/recycle-marker-icon-black-min.png',
				shadowUrl : 'lib/images/marker-shadow.png',
				iconSize : [29, 41],
				shadowSize : [41, 41],
				shadowAnchor : [13, 20]
			})
		});
		markers.addLayer(marker);
		return marker;
	}
});
map.addLayer(markers);

// Retrieve locations CSV and add them to map
$.ajax({
	type : 'GET',
	dataType : 'text',
	url : 'csv/locations.csv',
	error : function() {
		alert('No se han podido cargar los datos');
	},
	success : function(csv) {
		geo_csv.addData(csv);
		map.addLayer(geo_csv);
	}
});

// Add geo search
new L.Control.GeoSearch({
    provider: new L.GeoSearch.Provider.OpenStreetMap()
}).addTo(map);

// Google Analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-40714268-1', 'hol.es');
ga('send', 'pageview');
