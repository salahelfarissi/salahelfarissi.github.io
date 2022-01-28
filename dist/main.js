// Leaflet providers: https://leaflet-extras.github.io/leaflet-providers/preview/
// Stadia tilelayer
let Stadia_AlidadeSmooth = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
});

// CartoDB tilelayer
let CartoDB_Voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
});

// OSM tilelayer
let osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Initialize the map
// Coordinates of the center of Morocco from QGIS by right clicking on the map
let map = L.map('map').setView([29.3669, -9.0375], 5);
map.zoomControl.setPosition('topleft');

// Adding a default tilelayer
// Other tilelayers are in the main.js file
osm.addTo(map);
    
// Map scale
L.control.scale({
    imperial: false,
    maxWidth: 200,
    metric: true,
}).addTo(map);

// Add regions layer
let regions = L.geoJSON(regions_data, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);

// Full screen button
// A div must be added to the body to be able to add the full screen button
document.querySelector('.full-screen-button').addEventListener('click', function() {
    document.getElementById('map').requestFullscreen(); 
});

// Zoom to layer button
document.querySelector('.zoom-to-layer').addEventListener('click', function() {
    map.fitBounds(regions.getBounds());
});

// Colors for graduated map
function getColor(d) {
    return  d > 1170 ?  '#b30000' :
            d > 470  ?  '#e34a33' :
            d > 145  ?  '#fc8d59' :
            d > 17   ?  '#fdcc8a' :
                        '#fef0d9';
}

// Style for each region depending on the number of cases
function style(feature) {
    return {
        fillColor: getColor(feature.properties.new_cases_day_1),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

// The regions get highlighted when they are hovered with a mouse
// First we’ll define an event listener for layer mouseover event
function highlightFeature(e) {
    // Here we get access to the layer that was hovered through e.target
    var layer = e.target;

    layer.setStyle({
        weight: 3,
        color: '#D95F69',
        dashArray: '',
        fillOpacity: 0.7
    });
    // Bringing the highlighted state to the front so that the border doesn’t clash with nearby states
    // IE, Opera or Edge, have problems doing bringToFront on mouseover
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    // We need to update the control when the user hovers over a region
    info.update(layer.feature.properties);
}

// Here we define what happens on mouseout
// The regions.resetStyle method will reset the layer style to its default state (defined by our style function)
function resetHighlight(e) {
    regions.resetStyle(e.target);
    // We need to update the control when the user hovers over a region
    info.update();
}

// We define a click listener that zooms to the region when the user clicks on it
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

// Now we’ll use the onEachFeature option to add the listeners on our regions layers
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

// We’ll create a new info control to display the region name and the number of cases
// I also added some CSS styles in the home.css file
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>Coronavirus in Morocco</h4>' +  (props ?
        '<b>' + props.r_nom + '</b><br />' + props.new_cases_day_1 + ' new cases'
        : 'Hover over a region');
};

info.addTo(map);

// We’ll create a legend control to display classes of colors
// I aslo added css styles in the home.css file
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 17, 145, 470, 1170, 1810],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);

// Leaflet layer control
let baseMaps = {
    "Stadia Alidade Smooth": Stadia_AlidadeSmooth,
    "CartoDB Voyager": CartoDB_Voyager,
    "OSM": osm
};

let overlayMaps = {
    'Regions': regions
}

L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(map);
