$(function() {
    let regionsCentroid;
    
    // Initialize the map
    // Coordinates of the center of Morocco from QGIS by right clicking on the map
    let map = L.map('map', {
        zoomSnap: 0.1,
        zoomDelta: 0.4,
        minZoom: 5,
        maxZoom: 7.5,
        zoomControl: true
    }).setView([28.6, -9.0375], 5);

    // OSM tilelayer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Style for regions baselayer
    function style() {
    return {
        fillColor: '#E5E5E3',
        weight: 1,
        opacity: 1,
        color: '#000000',
        dashArray: '4',
        fillOpacity: 0.7
        };
    }

    L.geoJson(regions, {
            style: style}).addTo(map);

    $.getJSON("./data/regions_centroid.json")
        .done(function(data) {
            let info = processData(data);

            createPropSymbols(info.timestamps, data);
            createLegend(info.min, info.max);
            createSliderUI(info.timestamps);
            createInfo();
        })
        .fail(function() {alert("There has been a problem loading the data.")});

    // Function to process the data
    function processData(data) {
        let timestamps = [];
        let min = Infinity;
        let max = -Infinity;

        for (let feature in data.features) {
            let properties = data.features[feature].properties;

            for (let attribute in properties) {
                if (attribute !== 'id' &&
                attribute !== 'r_nom' &&
                attribute !== 'lat' &&
                attribute !== 'long') {

                    // Search for a specified value within an array and return its index (or -1 if not found).
                    // jQuery.inArray( value, array [, fromIndex ] )
                    if ($.inArray(attribute, timestamps) === -1) {
                        timestamps.push(attribute);
                    }

                    if (properties[attribute] < min) {
                        min = properties[attribute];
                    }

                    if (properties[attribute] > max) {
                        max = properties[attribute];
                    }
                }
            }
        }

        return {
            timestamps: timestamps,
            min: min,
            max: max
        }
    }

    function createPropSymbols(timestamps, data) {
        // the logical nullish assignment ??= operator
        // In the below expression, L.geoJSON assigns to regionsCentroid
        // Only if regionsCentroid is null or undefined
        regionsCentroid ??= L.geoJSON(data, {
            pointToLayer: function(feature, latlng) {

                // TODO: Change circles color
                return L.circleMarker(latlng, {
                    fillColor: "#F0A909",
                    color: "#614504",
                    weight: 1,
                    fillOpacity: 0.6
                }).on({
                    mouseover: function() {
                        this.openPopup();
                        this.setStyle({color: 'yellow'});
                    },
                    mouseout: function() {
                        this.closePopup();
                        this.setStyle({color: '#614504'});

                    }

                }).addTo(map);
            }
        });
        updatePropSymbols(timestamps[0]);
    }

    function updatePropSymbols(timestamps) {
        regionsCentroid.eachLayer(function(layer) {
            
            let props = layer.feature.properties;
            let radius = calcPropRadius(props[timestamps]);
            let popupContent = "<b>" + String(props[timestamps]) +
            " nouveaux cas</b><br>" +
            "<i>" + props.r_nom + "<br>" +
            "</i>" +
            timestamps + "</i>" +
            " janvier 2022";
            layer.setRadius(radius);
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius),
                autoPan: false});
        });
    }

    function calcPropRadius(attributeValue) {
        let scaleFactor = 1;
        let area = attributeValue * scaleFactor;
        return Math.sqrt(area/Math.PI);
    }

    function createLegend(min, max) {

        if (min < 100) {
            min = 350;
        }

        function roundNumber(inNumber) {
            return (Math.round(inNumber/10) * 10);
        }

        let legend = L.control({position: 'bottomright'});

        legend.onAdd = function() {

            // Creates an element with tagName 'div', sets the className 'legend', and optionally appends it to container element.
            let legendContainer = L.DomUtil.create('div', 'legend');
            let symbolsContainer = L.DomUtil.create('div', 'symbolsContainer');
            let classes = [roundNumber(min), roundNumber((max-min)/2), roundNumber(max)];
            let legendCircle;
            let lastRadius = 0;
            let currentRadius;
            let margin;

            // Prevent mousedown event from propagating to the map
            L.DomEvent.disableClickPropagation(legendContainer);

            $(legendContainer).append("<h3 id='legendTitle'>Nouveaux cas</h3>");

            for (let i = 0; i<= classes.length - 1; i++) {
                legendCircle = L.DomUtil.create('div', 'legendCircle');
                currentRadius = calcPropRadius(classes[i]);
                margin = -currentRadius - lastRadius - 2;

                // Setting style using a template literal
                $(legendCircle).attr("style",
                    "width: " + (currentRadius * 2) + "px; " + 
                    "height: " + (currentRadius * 2) + "px; " +
                    "margin-left: " + margin + "px");

                $(legendCircle).append("<span class='legendValue'>" + classes[i] + ' <b><i>cas</i></b>' +"</span>");
                $(symbolsContainer).append(legendCircle);
                lastRadius = currentRadius;
            }

            $(legendContainer).append(symbolsContainer);

            return legendContainer;

        };

        legend.addTo(map);
    }

    function createSliderUI(timestamps) {
        let sliderControl = L.control({position: 'bottomleft'});
        sliderControl.onAdd = function() {
            let slider = L.DomUtil.create('input', 'range-slider');

            // Disables propagation of mousedown events to the map
            L.DomEvent.disableClickPropagation(slider);

            // $(selector).attr({attribute:value, attribute:value,...})
            $(slider).attr({
                'type': 'range',
                'max': timestamps[timestamps.length - 1],
                'min': timestamps[0],
                'step': 1,
                'value': String(timestamps[0])})
                .on('input change', function() {
                    const month = " janvier 2022";
                    updatePropSymbols($(this).val().toString());
                    $(".temporal-legend").text(this.value + month);
                });
                return slider;
    }
    sliderControl.addTo(map);
    createTemporalLegend(timestamps[0]);
    }

    function createTemporalLegend(startTimestamp) {
        let temporalLegend = L.control({position: 'bottomleft'});
        temporalLegend.onAdd = function() {
            let output = L.DomUtil.create('output', 'temporal-legend');
            $(output).text(startTimestamp);
            $(output).append(" janvier 2022");
            return output;
    }

    temporalLegend.addTo(map);
    }

    function createInfo() {
        let info = L.control();

        info.onAdd = function () {
            this._div = L.DomUtil.create('div', 'info');
            this.update();
            return this._div;
        };

        // method that we will use to update the control based on feature properties passed
        info.update = function () {
            this._div.innerHTML = '<h4>Carte covid, Maroc</h3>' + '<br>' + 'Passer la souris sur un symbole';
        };

        info.addTo(map);
    }
});