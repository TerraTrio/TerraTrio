// Encapsulation: The MarkerHandler class encapsulates the logic for marker creation and popup content.
class MarkerHandler {
  constructor(pin, map) {
    this.pin = pin; 
    this.map = map; 
    
    // Directly defining icon creation logic inside constructor
    const grassIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/TerraTrio/TerraTrio/refs/heads/main/photo/leaf-green.jpg',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    // Creating marker directly
    this.marker = L.marker([pin.pin_lat, pin.pin_long], { icon: grassIcon })
      .addTo(map)
      .bindPopup(`
        <div style="text-align: center;">
          <h4>${pin.pin_name}</h4>
          <p>Grass Height: ${pin.grass_height} cm</p>
          <p>Threshold: ${pin.grass_cut_threshold} cm</p>
          <p style="color: ${pin.grass_height >= pin.grass_cut_threshold ? "red" : "green"}; font-weight: bold;">
            ${pin.grass_height >= pin.grass_cut_threshold ? "Grass needs cutting!" : "Grass height is within limits."}
          </p>
          ${pin.last_cut_date ? `<p>Last Cut Date: ${pin.last_cut_date}</p>` : ""}
          ${pin.pin_image ? `<img src="${pin.pin_image}" onerror="this.src='default-placeholder.jpg';" alt="${pin.pin_name}" style="width: 100%; max-width: 200px; border-radius: 8px;">` : ""}
        </div>
      `);

    this.marker.on("click", () => this.handleClick());
  }

  handleClick() {
    console.log("Marker clicked:", this.pin.pin_name);
  }
}


class BaseMap {
  constructor(containerId, center, zoom) {
    this.map = L.map(containerId).setView(center, zoom);
    this.initTileLayer();
  }

  initTileLayer() {
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      minZoom: 17,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);
  }
}

// Inheritance: Extend BaseMap to create a custom MapHandler with additional functionality
class MapHandler extends BaseMap {
  constructor(mapElementId, jsonData) {
    super(mapElementId, [8.359997, 124.868352], 420);
    this.jsonData = jsonData;
    this.allMarkers = [];
    this.loadMapData(jsonData);
    this.addShowNextCutDatesButton();
  }

  loadMapData(jsonData) {
    if (!jsonData || !jsonData.map_polygon_vertices || !jsonData.map_pins) {
      throw new Error("Invalid JSON structure");
    }

    const features = L.featureGroup();
    const polygon = L.polygon(jsonData.map_polygon_vertices, { color: "blue" })
      .addTo(this.map)
      .bindPopup(jsonData.map_name);
    features.addLayer(polygon);

    // Creating markers directly without abstraction
    jsonData.map_pins.forEach(pin => {
      const grassIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/TerraTrio/TerraTrio/refs/heads/main/photo/leaf-green.jpg',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([pin.pin_lat, pin.pin_long], { icon: grassIcon })
        .addTo(this.map)
        .bindPopup(`
          <div style="text-align: center;">
            <h4>${pin.pin_name}</h4>
            <p>Grass Height: ${pin.grass_height} cm</p>
            <p>Threshold: ${pin.grass_cut_threshold} cm</p>
            <p style="color: ${pin.grass_height >= pin.grass_cut_threshold ? "red" : "green"}; font-weight: bold;">
              ${pin.grass_height >= pin.grass_cut_threshold ? "Grass needs cutting!" : "Grass height is within limits."}
            </p>
            ${pin.last_cut_date ? `<p>Last Cut Date: ${pin.last_cut_date}</p>` : ""}
            ${pin.pin_image ? `<img src="${pin.pin_image}" onerror="this.src='default-placeholder.jpg';" alt="${pin.pin_name}" style="width: 100%; max-width: 200px; border-radius: 8px;">` : ""}
          </div>
        `);

      marker.on("click", () => console.log("Marker clicked:", pin.pin_name));
      features.addLayer(marker);
    });

    this.map.fitBounds(features.getBounds());
  }

  calculateNextCutDates() {
    return this.jsonData.map_pins.map(pin => {
      const lastCutDate = new Date(pin.last_cut_date);
      const nextCutDate = new Date(lastCutDate);
      nextCutDate.setDate(lastCutDate.getDate() + 14); // Add 14 days to the last cut date
      return {
        pin_name: pin.pin_name,
        next_cut_date: nextCutDate.toISOString().split("T")[0]
      };
    });
  }

  addShowNextCutDatesButton() {
    const button = document.getElementById("showNextCutDates");
    const nextCutDatesList = document.getElementById("nextCutDatesList");

    button.addEventListener("click", () => {
      const nextCutDates = this.calculateNextCutDates();
      nextCutDatesList.innerHTML = "";
      nextCutDates.forEach(item => {
        const dateItem = document.createElement("p");
        dateItem.textContent = `${item.pin_name}: Next Cut Date - ${item.next_cut_date}`;
        nextCutDatesList.appendChild(dateItem);
      });
    });
  }

  // Directly searching for location based on name
  searchLocation(searchValue) {
    this.allMarkers.forEach(marker => {
      if (marker.pin.pin_name.toLowerCase().includes(searchValue.toLowerCase())) {
        marker.marker.addTo(this.map);
      } else {
        this.map.removeLayer(marker.marker);
      }
    
      })  ;
  }
}

fetch("app.json")
  .then((response) => response.json())
  .then((jsonData) => {
    const mapHandler = new MapHandler("map", jsonData);

    document.getElementById("searchInput").addEventListener("input", (event) => {
      const searchValue = event.target.value.toLowerCase();
      mapHandler.searchLocation(searchValue); // Directly search for location
    });
  })
  .catch((error) => console.error("Error fetching JSON:", error));
