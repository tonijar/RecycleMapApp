// When current location successfully found --> do nothing
function onLocationFound(e) {
	currentLocation = e;
	map.setZoom(14);
}

// When current location fails --> alert message
function onLocationError(err) {
	alert("Error en la geolocalización");
}

// Calculate distance between points
function distanceBetweenPoints(x, y, x0, y0) {
	return Math.sqrt((x -= x0) * x + (y -= y0) * y);
}

// Show map centered at current position.
var map = L.map('map', {zoom: 14});
// Current location
map.locate({
	setView: true,
	maxZoom: 18
});// Location control			
L.control.locate({
	position: 'topleft',  // set the location of the control
    drawCircle: true,  // controls whether a circle is drawn that shows the uncertainty about the location
    metric: true,  // use metric or imperial units
    onLocationFound: function(e) {onLocationFound(e)},  // define a successfull callback function
    onLocationError: function(err) {onLocationError(err)},  // define an error callback function
    title: "Posición actual",  // title of the locat control
    popupText: ["Estás aproximadamente a ", " de aquí"],  // text to appear if user clicks on circle
    setView: true, // automatically sets the map view to the user's location
    zoom:14,
    locateOptions: {enableHighAccuracy: true, zoom: 14}  // define location options e.g enableHighAccuracy: true).addTo(map);
}).addTo(map);

L.tileLayer('http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution : 'Maps by &copy; <a href="http://openstreetmap.org" rel="nofollow" target="_blank">OpenStreetMap<\/a> contributors \
	 <a rel="license" href="http://creativecommons.org/licenses/by-sa/2.0/" rel="nofollow" target="_blank">\
	 <img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-sa/2.0/80x15.png" /><\/a>',
	maxZoom : 18,
	zoom: 14
}).addTo(map);

// Add metric scale
L.control.scale({
	metric: true,
	imperial: false
}).addTo(map);

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
var mapMarkers = [];
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
		mapMarkers.push(marker);
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
    provider: new L.GeoSearch.Provider.OpenStreetMap(),
    zoomLevel: 14
}).addTo(map);

// Nearest point
L.Control.NearestPoint = L.Control.extend({
	options: {
		position: 'topleft',
		title: 'Punto limpio más cercano'
	},
	onAdd: function (map) {
		// create the control container with a particular class name
		var className = 'leaflet-control-nearest-point',
            classNames = className + ' leaflet-bar leaflet-control',
            container = L.DomUtil.create('div', classNames);
        
		var self = this;
        this._layer = new L.LayerGroup();
        this._layer.addTo(map);
        this._event = undefined;
        // nested extend so that the first can overwrite the second
        // and the second can overwrite the third
        this._locateOptions = L.extend(L.extend({
            'setView': false // have to set this to false because we have to
                             // do setView manually
        }, this.options.locateOptions));

        var link = L.DomUtil.create('a', 'leaflet-bar-part', container);
        link.href = '#';
        link.title = this.options.title;
        
        L.DomEvent
        	.on(link, 'click', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.preventDefault)
            .on(link, 'click', function() {
            	var distance = 0;
            	var nearestPoint;
            	for(var i = 0; i < mapMarkers.length; i++) {
            		var marker = mapMarkers[i];
            		var newDistance = distanceBetweenPoints(marker.getLatLng().lat, marker.getLatLng().lng, map.getCenter().lat, map.getCenter().lng);
            		if(distance == 0 || newDistance < distance) {
            			nearestPoint = marker;
            			distance = newDistance;
            		}
            	}
                if (!nearestPoint) {
                	alert("No se ha podido localizar el punto más cercano");
                }
                else {
                	map.setView(nearestPoint.getLatLng(), 14);
                	nearestPoint.openPopup();
                }
            })
			.on(link, 'dblclick', L.DomEvent.stopPropagation);
		
		return container;
	}
});

new L.Control.NearestPoint().addTo(map);

// Google Analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-40714268-1', 'hol.es');
ga('send', 'pageview');
