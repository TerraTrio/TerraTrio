class MarkerHandler {
  constructor(pin, map) {
    this.pin = pin;
    this.map = map;

    // Create a marker and bind a formatted popup
    this.marker = L.marker([pin.pin_lat, pin.pin_long])
      .addTo(map)
      .bindPopup(this.createPopupContent(pin)); // Use createPopupContent here

    // Add a click event for extra interactivity
    this.marker.on("click", () => this.handleClick());
  }

  createPopupContent(pin) {
    console.log("Last Cut Date:", pin.last_cut_date); // Debugging the date

    const needsCutting = pin.grass_height >= pin.grass_cut_threshold;

    const content = `
        <div style="text-align: center;">
            <h4>${pin.pin_name}</h4>
            <p>Grass Height: ${pin.grass_height} cm</p>
            <p>Threshold: ${pin.grass_cut_threshold} cm</p>
            <p style="color: ${needsCutting ? "red" : "green"}; font-weight: bold;">
                ${needsCutting ? "Grass needs cutting!" : "Grass height is within limits."}
            </p>
            ${pin.last_cut_date ? `
                <p>Last Cut Date: ${pin.last_cut_date}</p>
            ` : ""}
            ${pin.pin_image ? `
                <img 
                    src="${pin.pin_image}" 
                    onerror="this.src='default-placeholder.jpg';" 
                    alt="${pin.pin_name}" 
                    style="width: 100%; max-width: 200px; border-radius: 8px;">
            ` : ""}
        </div>
    `;
    return content;
}




}

  
  class LeafletMap {
    constructor(containerId, center, zoom) {
        this.map = L.map(containerId).setView(center, zoom);
        this.initTileLayer();
        this.markers = []; // Store marker references to open popup later
    }

    
  }

  class MapHandler {
    constructor(mapElementId, jsonData) {
      this.map = L.map(mapElementId).setView([8.359997, 124.868352], 420);
      this.allMarkers = [];
      
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        minZoom: 17,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(this.map);
  
      this.loadMapData(jsonData);
    }
  
    loadMapData(jsonData) {
      if (!jsonData || !jsonData.map_polygon_vertices || !jsonData.map_pins) {
        throw new Error("Invalid JSON structure");
      }
  
      var features = L.featureGroup();
  

      var polygon = L.polygon(jsonData.map_polygon_vertices, { color: "blue" })
        .addTo(this.map)
        .bindPopup(jsonData.map_name);
  
      features.addLayer(polygon);
  
     
      jsonData.map_pins.forEach(pin => {
        let markerHandler = new MarkerHandler(pin, this.map);
        this.allMarkers.push(markerHandler);
        features.addLayer(markerHandler.marker);
      });
  
     
      this.map.fitBounds(features.getBounds());
    }
  
  
    searchLocation(searchValue) {
        this.allMarkers.forEach(markerHandler => {
          if (markerHandler.pin.pin_name.toLowerCase().includes(searchValue.toLowerCase())) {
            markerHandler.marker.addTo(this.map); 
          } else {
            this.map.removeLayer(markerHandler.marker); 
          }
        });
      }
  }
  

 

  fetch("app.json")
    .then((response) => response.json())
    .then((jsonData) => {
      const mapHandler = new MapHandler("map", jsonData);
  
     
      document.getElementById("searchInput").addEventListener("input", (event) => {
        const searchValue = event.target.value.toLowerCase();
        mapHandler.searchLocation(searchValue);
      });
    })
    .catch((error) => console.error("Error fetching JSON:", error));

