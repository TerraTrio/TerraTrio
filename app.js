class LeafletMap {
    constructor(containerId, center, zoom) {
        this.map = L.map(containerId).setView(center, zoom);
        this.initTileLayer();
        this.markers = []; // Store marker references to open popup later
    }

    initTileLayer() {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
    }

    addMarker(lat, lng, title) {
        const marker = L.marker([lat, lng]).addTo(this.map);
        
        const popupContent = `
            <div class="popup-content">
                <h3>${title}</h3>
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQepD_lSJSEvx4gh9J_TTY8FI_oylNWRkbcA&s" class="card-img-top" alt="...">
                <p><strong>Latitude:</strong> ${lat}</p>
                <p><strong>Longitude:</strong> ${lng}</p>
                <a href="#" target="_blank">Learn more</a>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        this.markers.push({ lat, lng, title, marker });
        return marker;
    }
    

    openPopup(lat, lng) {
        const marker = this.markers.find(m => m.lat === lat && m.lng === lng);
        if (marker) {
            this.map.setView([lat, lng], 18); // Zoom to the marker's location
            marker.marker.openPopup(); // Open the popup
        }
    }

    loadMarkersFromJson(url) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                data.forEach(marker => {
                    this.addMarker(marker.latitude, marker.longitude, marker.title);
                });
            })
            .catch(error => console.error('Error loading markers:', error));
    }
}

const myMap = new LeafletMap('map', [8.360004, 124.868419], 14);

// Load markers from an external JSON file
myMap.loadMarkersFromJson('map-data.json');

class LocationCard {
    constructor(title, lat, lng) {
        this.title = title;
        this.lat = lat;
        this.lng = lng;
    }

    createCard() {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card location-card';
        cardDiv.innerHTML = `
            <div class="card-body">
              <div class="row">
                <div class="col-sm-4">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQepD_lSJSEvx4gh9J_TTY8FI_oylNWRkbcA&s" class="card-img-top" alt="...">
                </div>
                <div class="col-sm-8">
                     <h5 class="card-title">${this.title}</h5>
                     <p class="card-text placeholder-glow">
                    <span class="placeholder col-7"></span>
                    <span class="placeholder col-4"></span>
                    <span class="placeholder col-4"></span>
                    <span class="placeholder col-6"></span>
                    <span class="placeholder col-8"></span>
                    </p>
                </div>        
              </div>
            </div>
        `;
        
        // Add a click event to the card to open the corresponding marker popup
        cardDiv.addEventListener('click', () => {
            myMap.openPopup(this.lat, this.lng); // Open the popup for the corresponding marker
        });

        return cardDiv;
    }
}

class LocationRenderer {
    constructor(containerId, searchInputId) {
        this.container = document.getElementById(containerId);
        this.searchInput = document.getElementById(searchInputId);
        this.appletData = [];
        this.filteredData = [];
        this.searchInput.addEventListener('input', () => this.filterLocations());
    }

    fetchLocationData(url) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                this.appletData = data;
                this.filteredData = data;  // initially show all locations
                this.renderLocation(this.filteredData);  // render all initially
            })
            .catch(error => console.error('Error loading location data:', error));
    }

    renderLocation(data) {
        this.container.innerHTML = '';  // clear the container before rendering new items
        data.forEach(location => {
            const locationCard = new LocationCard(location.title, location.latitude, location.longitude);
            const cardElement = locationCard.createCard();
            this.container.appendChild(cardElement);
        });
    }

    filterLocations() {
        const query = this.searchInput.value.toLowerCase();  // get search query
        this.filteredData = this.appletData.filter(location =>
            location.title.toLowerCase().includes(query) ||
            (location.description && location.description.toLowerCase().includes(query))  // check description as well
        );
        this.renderLocation(this.filteredData);  // render the filtered data
    }
}

const locationRenderer = new LocationRenderer('location-container', 'searchLocation');
locationRenderer.fetchLocationData('');