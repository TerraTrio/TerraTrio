class MarkerHandler {
    constructor(pin, map) {
      this.pin = pin;
      this.map = map;
      this.marker = L.marker([pin.pin_lat, pin.pin_long]).addTo(map)
        .bindPopup(pin.pin_name);
      
   
      this.marker.on("click", () => this.handleClick());
    }
  
    handleClick() {
      const display = document.getElementById("infoDisplay");
      display.innerHTML = ""; 
      const cardContainer = document.createElement("div");
      cardContainer.className = "card";
  
      const label = document.createElement("h4");
      label.textContent = this.pin.pin_name;
      cardContainer.appendChild(label);
  
      const info = document.createElement("p");
      info.textContent = "Number of PCs: " + this.pin.pin_num_pc;
      cardContainer.appendChild(info);
  
     
      const printersInfo = document.createElement("p");
      printersInfo.textContent = "Number of Printers: " + this.pin.pin_num_printers;
      cardContainer.appendChild(printersInfo);
  
      const btnContainer = document.createElement("div");
      btnContainer.id = "btnContainer";
      cardContainer.appendChild(btnContainer);
  
      const reserveBtn = document.createElement("button");
      reserveBtn.id = "cardBtn";
      reserveBtn.textContent = "Reserve";
      reserveBtn.style.backgroundColor = "orange";
      btnContainer.appendChild(reserveBtn);
  
      const occupyBtn = document.createElement("button");
      occupyBtn.id = "cardBtn";
      occupyBtn.textContent = "Occupy";
      occupyBtn.style.backgroundColor = "red";
      btnContainer.appendChild(occupyBtn);
  

      reserveBtn.addEventListener("click", () => {
        cardContainer.style.backgroundColor = "blue";
      });
  
      occupyBtn.addEventListener("click", () => {
        cardContainer.style.backgroundColor = "red";
      });
  
      display.appendChild(cardContainer);
    }
  }
  
  class LeafletMap {
    constructor(containerId, center, zoom) {
        this.map = L.map(containerId).setView(center, zoom);
        this.initTileLayer();
        this.markers = []; // Store marker references to open popup later
    }

    initTileLayer() {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 20,
            minZoom: 17,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
    }
  }

  class MapHandler {
    constructor(mapElementId, jsonData) {
      this.map = L.map(mapElementId).setView([8.359997, 124.868352], 420);
      this.allMarkers = [];
      
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(this.map);
  
      this.loadMapData(jsonData);
    }
  
    loadMapData(jsonData) {
      if (!jsonData || !jsonData.map_polygon_vertices || !jsonData.map_pins) {
        throw new Error("Invalid JSON structure");
      }
  
      var features = L.featureGroup();
  

      var polygon = L.polygon(jsonData.map_polygon_vertices, { color: "green" })
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
  

 

  fetch("./app.json")
    .then((response) => response.json())
    .then((jsonData) => {
      const mapHandler = new MapHandler("map", jsonData);
  
     
      document.getElementById("searchInput").addEventListener("input", (event) => {
        const searchValue = event.target.value.toLowerCase();
        mapHandler.searchLocation(searchValue);
      });
    })
    .catch((error) => console.error("Error fetching JSON:", error));