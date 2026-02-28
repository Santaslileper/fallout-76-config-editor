import { config } from './state.js';
import { elements } from './elements.js';
import { showNotification } from './utils.js';
import { generateOutput } from './ui.js';
import { SETTINGS_DATABASE } from './settings_db.js';
import { minervaSchedule, minervaItems, eventsList, statusList, advancedList, newsItems } from './data.js';
import { MAP_DATABASE } from './markers.js';

let onConfigInit = null;
export function setConfigUpdateCallback(fn) {
    onConfigInit = fn;
}

let currentDbTab = 'minerva';
let selectedDbItem = null;
let wishlist = [];
let visibleCategories = new Set([49, 50, 70, 64, 63]);
let mapZoom = 1;
const MAP_SIZE = 4096;

const MAP_BOUNDS = {
    minLat: 0.40,
    maxLat: 0.95,
    minLon: -1.0,
    maxLon: -0.45
};

function normalizeCoord(lat, lon) {
    const x = (parseFloat(lon) - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon);
    const y = 1 - (parseFloat(lat) - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat);
    return { x, y };
}

export function startNewsTicker() {
    const atomCount = document.getElementById('atom-count');
    const atomIcon = document.querySelector('.atom-icon');
    if (!atomCount) return;

    if (atomIcon) atomIcon.textContent = 'ⓘ';
    atomCount.parentElement.style.width = '600px';
    atomCount.parentElement.style.justifyContent = 'flex-end';
    atomCount.style.fontSize = '20px';

    let newsIndex = 0;

    setInterval(() => {
        atomCount.style.opacity = 0;
        setTimeout(() => {
            atomCount.textContent = newsItems[newsIndex];
            atomCount.style.opacity = 1;
            newsIndex = (newsIndex + 1) % newsItems.length;
        }, 500);
    }, 5000);

    atomCount.textContent = newsItems[0];
}

export function initDatabase() {
    updateMinervaTimer();
    const tabs = document.querySelectorAll('.db-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentDbTab = tab.dataset.dbtab;
            selectedDbItem = null;
            renderDatabase();
        });
    });
    renderDatabase();
}

const MINERVA_COORDS = {
    "The Whitespring Resort": { lat: 0.655, lon: -0.718 },
    "Fort Atlas": { lat: 0.852, lon: -0.661 },
    "Foundation": { lat: 0.589, lon: -0.655 },
    "Crater": { lat: 0.908, lon: -0.613 }
};

function updateMinervaTimer() {
    const timerEl = document.getElementById('minerva-timer');
    if (!timerEl) return;

    const now = new Date();
    let activeEvent = minervaSchedule.find(e => now >= new Date(e.start) && now <= new Date(e.end));

    if (activeEvent) {
        const remaining = new Date(activeEvent.end) - now;
        const h = Math.floor(remaining / (1000 * 60 * 60));
        const m = Math.floor((remaining / (1000 * 60)) % 60);
        const s = Math.floor((remaining / 1000) % 60);

        const locName = activeEvent.location;
        const locLink = `<span class="map-link" onclick="centerMapOnLocation('${locName}')" style="color: var(--f76-yellow); cursor: pointer; text-decoration: underline;">${locName.toUpperCase()}</span>`;

        timerEl.innerHTML = `<span style="color: var(--f76-yellow); font-weight: bold;">ACTIVE @ ${locLink}</span> | REMAINING: ${h}h ${m}m ${s}s`;
    } else {
        const nextEvent = minervaSchedule.find(e => new Date(e.start) > now);
        if (nextEvent) {
            const remaining = new Date(nextEvent.start) - now;
            const d = Math.floor(remaining / (1000 * 60 * 60 * 24));
            const h = Math.floor((remaining / (1000 * 60 * 60)) % 24);
            const m = Math.floor((remaining / (1000 * 60)) % 60);
            const s = Math.floor((remaining / 1000) % 60);

            const locName = nextEvent.location;
            const locLink = `<span class="map-link" onclick="centerMapOnLocation('${locName}')" style="color: var(--f76-yellow); cursor: pointer; text-decoration: underline;">${locName.toUpperCase()}</span>`;

            let timeStr = d > 0 ? `${d}d ${h}h` : `${h}h ${m}m ${s}s`;
            timerEl.innerHTML = `<span style="color: #ff4444">OFFLINE</span> | RETURNS AT ${locLink} IN ${timeStr}`;
        } else {
            timerEl.textContent = "SCHEDULE ENDED";
        }
    }
}

window.centerMapOnLocation = function (name) {
    const coords = MINERVA_COORDS[name];
    if (coords) {
        // Switch to map tab first
        const mapTab = Array.from(document.querySelectorAll('.db-tab')).find(t => t.textContent.toLowerCase().includes('map'));
        if (mapTab) mapTab.click();

        setTimeout(() => {
            centerMapOn(coords.lat, coords.lon);
            showNotification(`LOCATED: ${name.toUpperCase()}`, false);
        }, 100);
    }
};

function centerMapOn(lat, lon) {
    const mapContainer = document.getElementById('db-map-container');
    const mapInner = document.getElementById('map-inner');
    if (!mapContainer || !mapInner) return;

    const coords = normalizeCoord(lat, lon);

    mapInner.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    const targetX = -(coords.x * MAP_SIZE * mapZoom - mapContainer.clientWidth / 2);
    const targetY = -(coords.y * MAP_SIZE * mapZoom - mapContainer.clientHeight / 2);

    mapInner.style.left = targetX + 'px';
    mapInner.style.top = targetY + 'px';

    setTimeout(() => { mapInner.style.transition = 'none'; }, 500);
}

setInterval(updateMinervaTimer, 1000);

function renderDatabase() {
    const listContainer = document.getElementById('db-list-container');
    const mapContainer = document.getElementById('db-map-container');
    const statsBox = document.getElementById('db-stats-box');
    const wishlistContainer = document.getElementById('wishlist-container');

    if (!listContainer || !mapContainer) return;

    if (currentDbTab === 'map') {
        listContainer.style.display = 'none';
        wishlistContainer.style.display = 'none';
        statsBox.style.display = 'none';
        const mapWrapper = document.getElementById('db-map-wrapper');
        if (mapWrapper) {
            mapWrapper.style.display = 'flex';
            renderMap();
        }
        return;
    } else {
        listContainer.style.display = 'block';
        wishlistContainer.style.display = 'block';
        statsBox.style.display = 'block';
        const mapWrapper = document.getElementById('db-map-wrapper');
        if (mapWrapper) mapWrapper.style.display = 'none';
    }

    listContainer.innerHTML = '';
    let data = [];

    if (currentDbTab === 'minerva') data = minervaItems;
    else if (currentDbTab === 'events') data = eventsList;
    else if (currentDbTab === 'status') data = statusList;
    else if (currentDbTab === 'advanced') data = advancedList;

    data.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'db-row';
        if (selectedDbItem === item) row.classList.add('selected');

        const displayVal = item.cost || item.value;
        const isWishlisted = wishlist.some(i => i.name === item.name);

        row.innerHTML = `
            <span class="db-col-name">${item.name}</span>
            <div style="display: flex; align-items: center; gap: 10px;">
                <span class="db-col-val" style="color: ${item.cost ? 'var(--f76-yellow)' : ''}">${displayVal}</span>
                ${currentDbTab === 'minerva' ? `<button class="wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist(${index})">★</button>` : ''}
            </div>
        `;

        row.onclick = () => {
            selectedDbItem = item;
            renderDatabase();
            updateDbStats(item);
        };
        listContainer.appendChild(row);
    });

    if (!selectedDbItem && data.length > 0) {
        selectedDbItem = data[0];
        updateDbStats(data[0]);
        const firstRow = listContainer.firstElementChild;
        if (firstRow) firstRow.classList.add('selected');
    }
}

window.toggleWishlist = function (index) {
    const item = minervaItems[index];
    const existingIndex = wishlist.findIndex(i => i.name === item.name);
    if (existingIndex > -1) {
        wishlist.splice(existingIndex, 1);
    } else {
        wishlist.push(item);
    }
    renderDatabase();
    updateWishlistUI();
};

function updateWishlistUI() {
    const container = document.getElementById('wishlist-container');
    if (!container) return;
    container.innerHTML = '<h4>WISHLIST</h4>';
    let totalGold = 0;
    wishlist.forEach(item => {
        const gold = parseInt(item.cost) || 0;
        totalGold += gold;
        const el = document.createElement('div');
        el.style.fontSize = '14px';
        el.style.padding = '5px 0';
        el.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        el.innerHTML = `<span style="color: var(--f76-yellow)">${gold}</span> ${item.name}`;
        container.appendChild(el);
    });
    const totalEl = document.createElement('div');
    totalEl.style.marginTop = '10px';
    totalEl.style.fontWeight = 'bold';
    totalEl.style.borderTop = '2px solid var(--f76-yellow)';
    totalEl.innerHTML = `TOTAL: <span style="color: var(--f76-yellow)">${totalGold} Gold</span>`;
    container.appendChild(totalEl);
}

function updateDbStats(item) {
    const nameEl = document.getElementById('db-item-name');
    const valEl = document.getElementById('db-item-value');
    const weightEl = document.getElementById('db-item-weight');
    const descEl = document.getElementById('db-item-desc');

    if (nameEl) nameEl.textContent = item.name;
    if (valEl) valEl.textContent = item.value;
    if (weightEl) weightEl.textContent = item.weight;
    if (descEl) descEl.textContent = item.desc;
}

export function performSettingsSearch() {
    if (typeof SETTINGS_DATABASE === 'undefined') {
        console.warn("SETTINGS_DATABASE not found");
        return;
    }
    const query = elements.searchBar.value.toLowerCase().trim();
    if (!query) return;

    const results = SETTINGS_DATABASE.filter(line => line.toLowerCase().includes(query));
    elements.searchResults.innerHTML = '';

    if (results.length === 0) {
        elements.searchResults.innerHTML = '<div style="padding: 20px; text-align: center; color: #888;">NO SETTINGS FOUND FOR "' + query + '"</div>';
        return;
    }

    results.forEach(setting => {
        const div = document.createElement('div');
        div.className = 'search-result-item';
        div.style.padding = '10px 15px';
        div.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';

        const text = document.createElement('span');
        text.style.fontFamily = 'Courier New';
        text.style.fontSize = '14px';
        text.style.color = 'var(--f76-text-normal)';
        text.textContent = setting;

        const btn = document.createElement('button');
        btn.textContent = '+ ADD';
        btn.className = 'mini-btn';
        btn.style.background = 'var(--f76-yellow)';
        btn.style.color = 'black';
        btn.style.border = 'none';
        btn.style.padding = '4px 10px';
        btn.style.cursor = 'pointer';
        btn.style.fontWeight = 'bold';
        btn.onclick = () => addToCustomIniFromSearch(setting);

        div.appendChild(text);
        div.appendChild(btn);
        elements.searchResults.appendChild(div);
    });
}

function addToCustomIniFromSearch(setting) {
    const match = setting.match(/\[(.*)\]\s+(.*)/);
    if (!match) return;

    const section = match[1];
    const key = match[2];

    const value = prompt(`Enter value for ${key}:\n(0=Off, 1=On, or custom value)`, "1");
    if (value === null) return;

    const line = `\n[${section}]\n${key}=${value}\n`;
    config.customIniLines += line;

    const textArea = document.getElementById('custom-ini');
    if (textArea) textArea.value = config.customIniLines;

    showNotification(`ADDED ${key} TO CUSTOM INI`);
    if (onConfigInit) onConfigInit();
}

function initMapUI() {
    const catList = document.getElementById('map-category-list');
    if (!catList) return;
    catList.innerHTML = '';

    // Sort categories by title
    const cats = Object.values(MAP_DATABASE.categories).sort((a, b) => a.title.localeCompare(b.title));

    cats.forEach(cat => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.gap = '5px';
        item.style.padding = '2px 5px';
        item.style.cursor = 'pointer';
        item.style.fontSize = '11px';
        item.style.color = visibleCategories.has(cat.id) ? '#fff' : '#666';

        const dot = document.createElement('div');
        dot.style.width = '8px';
        dot.style.height = '8px';
        dot.style.borderRadius = '50%';
        dot.style.background = visibleCategories.has(cat.id) ? 'var(--f76-yellow)' : '#333';

        item.appendChild(dot);
        item.appendChild(document.createTextNode(cat.title.toUpperCase()));

        item.onclick = () => {
            if (visibleCategories.has(cat.id)) visibleCategories.delete(cat.id);
            else visibleCategories.add(cat.id);
            initMapUI();
            const mapInner = document.getElementById('map-inner');
            if (mapInner) mapInner.remove(); // Force re-render markers
            renderMap();
        };
        catList.appendChild(item);
    });

    // Jump buttons
    document.querySelectorAll('.jump-btn').forEach(btn => {
        btn.onclick = () => {
            const lat = parseFloat(btn.dataset.lat);
            const lng = parseFloat(btn.dataset.lng);
            jumpTo(lat, lng);
        };
    });
}

function jumpTo(lat, lng) {
    centerMapOn(lat, lng);
}

function renderMap() {
    const mapContainer = document.getElementById('db-map-container');
    if (!mapContainer || mapContainer.querySelector('#map-inner')) return;

    initMapUI();

    mapContainer.style.background = '#0a0a0a';
    mapContainer.style.cursor = 'grab';
    mapContainer.style.overflow = 'hidden';

    const mapInner = document.createElement('div');
    mapInner.id = 'map-inner';
    mapInner.style.position = 'absolute';

    const MAP_SIZE = 4096;
    mapInner.style.width = MAP_SIZE + 'px';
    mapInner.style.height = MAP_SIZE + 'px';

    const startCoords = normalizeCoord(0.817, -0.833); // Vault 76 center
    mapInner.style.left = `-${(startCoords.x * MAP_SIZE) - mapContainer.clientWidth / 2}px`;
    mapInner.style.top = `-${(startCoords.y * MAP_SIZE) - mapContainer.clientHeight / 2}px`;

    mapInner.style.backgroundImage = 'url("assets/map_highrez.jpg")';
    mapInner.style.backgroundSize = '100% 100%';
    mapInner.style.backgroundPosition = '0 0';
    mapInner.style.backgroundRepeat = 'no-repeat';
    mapContainer.appendChild(mapInner);

    let isDragging = false;
    let startX, startY, startLeft, startTop;

    mapContainer.onmousedown = (e) => {
        isDragging = true;
        mapContainer.style.cursor = 'grabbing';
        startX = e.pageX;
        startY = e.pageY;
        startLeft = parseInt(mapInner.style.left) || 0;
        startTop = parseInt(mapInner.style.top) || 0;
    };

    window.onmousemove = (e) => {
        if (!isDragging) return;
        const dx = e.pageX - startX;
        const dy = e.pageY - startY;

        let newX = startLeft + dx;
        let newY = startTop + dy;

        const limitX = -(MAP_SIZE - mapContainer.clientWidth);
        const limitY = -(MAP_SIZE - mapContainer.clientHeight);

        newX = Math.min(0, Math.max(limitX, newX));
        newY = Math.min(0, Math.max(limitY, newY));

        mapInner.style.left = newX + 'px';
        mapInner.style.top = newY + 'px';
    };

    window.onmouseup = () => {
        isDragging = false;
        mapContainer.style.cursor = 'grab';
    };

    // Zoom logic
    mapContainer.onwheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.8 : 1.25;
        const oldZoom = mapZoom;
        const newZoom = Math.min(4, Math.max(0.2, mapZoom * delta));

        if (oldZoom === newZoom) return;

        const rect = mapContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const currentLeft = parseInt(mapInner.style.left) || 0;
        const currentTop = parseInt(mapInner.style.top) || 0;

        // Content coords relative to unpanned, zoomed map
        const contentX = (mouseX - currentLeft) / oldZoom;
        const contentY = (mouseY - currentTop) / oldZoom;

        const newLeft = mouseX - contentX * newZoom;
        const newTop = mouseY - contentY * newZoom;

        mapZoom = newZoom;

        mapInner.style.width = (MAP_SIZE * mapZoom) + 'px';
        mapInner.style.height = (MAP_SIZE * mapZoom) + 'px';
        mapInner.style.left = newLeft + 'px';
        mapInner.style.top = newTop + 'px';

        updateMarkerScaling();
    };

    // Add markers
    MAP_DATABASE.locations.forEach(marker => {
        if (!visibleCategories.has(marker.category_id)) return;

        const pin = document.createElement('div');
        pin.className = 'map-pin';
        pin.title = marker.title;
        pin._data = marker; // For scaling

        const coords = normalizeCoord(marker.latitude, marker.longitude);

        const x = coords.x * MAP_SIZE * mapZoom;
        const y = coords.y * MAP_SIZE * mapZoom;

        pin.style.left = x + 'px';
        pin.style.top = y + 'px';
        pin.style.position = 'absolute';

        const baseSize = 12;
        const scaledSize = Math.max(8, baseSize / Math.sqrt(mapZoom));
        pin.style.width = scaledSize + 'px';
        pin.style.height = scaledSize + 'px';

        // Colored based on categories
        let color = '#eee';
        if (marker.category_id === 49) color = '#FACD29'; // Collectibles
        if (marker.category_id === 63) color = '#58a6ff'; // Vaults
        if (marker.category_id === 64) color = '#afff96'; // Towns
        if (marker.category_id === 70) color = '#ff7b72'; // Locations
        if (marker.category_id === 66) color = '#d2a8ff'; // Stations

        pin.style.background = color;
        pin.style.border = '2px solid rgba(0,0,0,0.8)';
        pin.style.borderRadius = '50%';
        pin.style.transform = 'translate(-50%, -50%)';
        pin.style.boxShadow = '0 0 8px rgba(0,0,0,0.6)';
        pin.style.cursor = 'help';
        pin.style.zIndex = '5';

        pin.onclick = (e) => {
            e.stopPropagation();
            const desc = marker.description ? marker.description.replace(/\*\*/g, '') : 'LOCATION';
            showNotification(`${marker.title.toUpperCase()}: ${desc}`, false);
        };

        mapInner.appendChild(pin);
    });

    // Add Minerva marker if active
    const now = new Date();
    let minervaHost = minervaSchedule.find(e => now >= new Date(e.start) && now <= new Date(e.end));
    if (minervaHost) {
        const coords = MINERVA_COORDS[minervaHost.location];
        if (coords) {
            const mPin = document.createElement('div');
            mPin.className = 'map-pin minerva-pin';
            mPin.title = "MINERVA IS HERE";

            const x = ((coords.lon + 1) / 2) * MAP_SIZE;
            const y = ((1 - coords.lat) / 2) * MAP_SIZE;

            mPin.style.left = x + 'px';
            mPin.style.top = y + 'px';
            mPin.style.position = 'absolute';
            mPin.style.width = '24px';
            mPin.style.height = '24px';
            mPin.style.background = 'var(--f76-yellow)';
            mPin.style.border = '3px solid #000';
            mPin.style.borderRadius = '50%';
            mPin.style.transform = 'translate(-50%, -50%)';
            mPin.style.zIndex = '100';
            mPin.style.boxShadow = '0 0 15px var(--f76-yellow)';
            mPin.style.display = 'flex';
            mPin.style.alignItems = 'center';
            mPin.style.justifyContent = 'center';
            mPin.innerHTML = '<span style="color:black; font-weight:900; font-size:14px;">M</span>';

            // Pulsing animation
            mPin.animate([
                { boxShadow: '0 0 5px var(--f76-yellow)' },
                { boxShadow: '0 0 20px var(--f76-yellow)' },
                { boxShadow: '0 0 5px var(--f76-yellow)' }
            ], { duration: 1500, iterations: Infinity });

            mapInner.appendChild(mPin);
        }
    }
}

function updateMarkerScaling() {
    const pins = document.querySelectorAll('.map-pin');
    const baseSize = 14;
    const minSize = 6;
    const scaledSize = Math.max(minSize, baseSize / Math.sqrt(mapZoom));
    const MAP_SIZE = 4096;

    pins.forEach(pin => {
        pin.style.width = scaledSize + 'px';
        pin.style.height = scaledSize + 'px';

        const marker = pin._data;
        if (marker) {
            const coords = normalizeCoord(marker.latitude, marker.longitude);
            pin.style.left = (coords.x * MAP_SIZE * mapZoom) + 'px';
            pin.style.top = (coords.y * MAP_SIZE * mapZoom) + 'px';
        }
    });

    const mPin = document.querySelector('.minerva-pin');
    if (mPin) {
        const mScaled = scaledSize * 2;
        mPin.style.width = mScaled + 'px';
        mPin.style.height = mScaled + 'px';
    }
}
