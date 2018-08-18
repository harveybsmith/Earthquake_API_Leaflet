const API_KEY = "pk.eyJ1Ijoia3VsaW5pIiwiYSI6ImNpeWN6bjJ0NjAwcGYzMnJzOWdoNXNqbnEifQ.jEzGgLAwQnZCv9rA6UTfxQ";



// Define variables for tile layers
var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
});

var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.satellite",
  accessToken: API_KEY
});

var outdoorsman = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.run-bike-hike",
  accessToken: API_KEY
});

// Define a baseMaps object to hold our base layers
var baseMaps = {
  "Street Map": streetmap,
  "Satellite": satellite,
  "Run-Bike-Hike": outdoorsman
};

// store API endpoints

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson"

var faultLinesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"


d3.json(queryUrl, function (data) {

    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place + " , " + feature.properties.mag +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(data.features, {
      pointToLayer: function (geoJsonPoint, latlng) {
        return L.circleMarker(latlng, {
          fillOpacity: 1,
          color: "#000",
          radius: markerSize(geoJsonPoint.properties.mag),
          fillColor: markerColor(geoJsonPoint.properties.mag),
          weight: 1
        });
      },
      onEachFeature: onEachFeature
    });

    // Our marker size function that will give each city a different radius based on its population
    function markerSize(mag) {
      return mag * 1.5;
    }

    d3.json(faultLinesLink, (err, data) => {
      if (err) throw err;
      var faults = L.geoJSON(data.features, {
        style: {
          color: "orange",
          fillColor: "none"
        }
      });

      createMap(earthquakes, faults);
    });

  // Sending our earthquakes and plates layers to the createMap functio
});

function markerColor(mag) {
  if (mag <= 2) {
    return '#FFEDA0'
  }
  else if (mag <= 3) {
    return '#FED976'
  }
  else if (mag <= 4) {
    return '#FEB24C'
  }
  else if (mag <= 5) {
    return '#FD8D3C'
  }
  else if (mag <= 6) {
    return '#FC4E2A'
  }
  else if (mag <= 7) {
    return '#E31A1C'
  }
  else if (mag <= 8) {
    return '#BD0026'
  }
  else if (mag <= 9) {
    return '#800026'
  }
  else {
    return 'rgb(139,0,139)'
  }
}

function createMap(earthquakes, faults) {

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines": faults    
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [streetmap, earthquakes, faults]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Add a legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info legend'),
          grades = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
          labels = [];

      div.innerHTML+='Magnitude<br><hr>'
  
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + markerColor(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
  
  return div;
  };
  
  legend.addTo(myMap); 
}

