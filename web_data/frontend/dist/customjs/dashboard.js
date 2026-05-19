let map = null;
let markerLayer = null;

const breachColors = {};
const STATS_MAX_AGE_MS = 60 * 60 * 1000;

async function getTopStatsData() {
    try {
        const response = await fetch("/api/breaches/stats");

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "success") {
            const cached = {
                data: data.data,
                fetchedAt: Date.now()
            };

            localStorage.setItem("stats", JSON.stringify(cached));

            return cached;
        }

        return null;
    } catch (error) {
        console.error("Request failed:", error);
        return null;
    }
}

function formatStatsAge(fetchedAt) {
    const ageMs = Date.now() - fetchedAt;
    const minutes = Math.floor(ageMs / 60000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;

    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
}

async function loadStatsData() {
    let statsData = null;
    let fetchedAt = null;

    const cachedStats = localStorage.getItem("stats");

    if (cachedStats) {
        try {
            const parsed = JSON.parse(cachedStats);

            if (parsed && parsed.fetchedAt) {
                if (Date.now() - parsed.fetchedAt < STATS_MAX_AGE_MS) {
                    statsData = parsed.data;
                    fetchedAt = parsed.fetchedAt;
                } else {
                    localStorage.removeItem("stats");
                }
            } else {
                localStorage.removeItem("stats");
            }
        } catch (error) {
            console.error("Failed to parse cached stats:", error);
            localStorage.removeItem("stats");
        }
    }

    if (!statsData) {
        const result = await getTopStatsData();

        if (result) {
            statsData = result.data;
            fetchedAt = result.fetchedAt;
        }
    }

    if (!statsData) return;

    const ageText = fetchedAt ? `Updated ${formatStatsAge(fetchedAt)}` : "";

    const ageSuffix = ageText
        ? `<small class="text-muted d-block" style="font-size:0.8em">${ageText}</small>`
        : "";

    const recordsElement = document.getElementById("records_count");
    const breachesElement = document.getElementById("breaches_count");

    if (recordsElement) {
        recordsElement.innerHTML =
            `${Number(statsData.total_entries || 0).toLocaleString()} records stored${ageSuffix}`;
    }

    if (breachesElement) {
        breachesElement.innerHTML =
            `${Number(statsData.breaches || 0).toLocaleString()} breaches monitored${ageSuffix}`;
    }
}














// // ─── Leaflet map ─────────────────────────────────────────────────────────────

// const CONTINENTS = [
//     { name: "North America", lat: 54,  lng: -100, bounds: { north: 72,  south: 15,  east: -50,  west: -168 } },
//     { name: "South America", lat: -15, lng: -60,  bounds: { north: 13,  south: -56, east: -34,  west: -82  } },
//     { name: "Europe",        lat: 54,  lng: 15,   bounds: { north: 72,  south: 34,  east: 45,   west: -25  } },
//     { name: "Africa",        lat: 5,   lng: 20,   bounds: { north: 38,  south: -35, east: 52,   west: -18  } },
//     { name: "Asia",          lat: 45,  lng: 90,   bounds: { north: 78,  south: 0,   east: 145,  west: 25   } },
//     { name: "Oceania",       lat: -25, lng: 135,  bounds: { north: 0,   south: -50, east: 180,  west: 110  } },
// ];

// function initBreachMap() {
//     map = L.map("breach-map", {
//         preferCanvas: true
//     }).setView([20, 0], 2);

//     L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_dark/{z}/{x}/{y}{r}.{ext}', {
//         minZoom: 0,
//         maxZoom: 20,
//         attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//         ext: 'png'
//     }).addTo(map);

//     markerLayer = L.layerGroup().addTo(map);

//     loadContinentMarkers();
// }

// async function fetchContinentCount(continent) {
//     let total = 0;
//     let offset = 0;

//     while (true) {
//         const params = new URLSearchParams({
//             north: continent.bounds.north,
//             south: continent.bounds.south,
//             east: continent.bounds.east,
//             west: continent.bounds.west,
//             zoom: 2,
//             limit: 5000,
//             offset
//         });

//         const response = await fetch(`/api/breaches/map?${params}`, {
//             headers: { "API-KEY": Cookies.get("auth") || "" }
//         });

//         if (!response.ok) break;

//         const json = await response.json();
//         if (json.status !== "success") break;

//         const rows = json.data.rows || [];
//         total += rows.reduce((sum, row) => sum + Number(row.count || 0), 0);

//         if (rows.length < 5000) break;
//         offset += 5000;
//     }

//     return total;
// }

// async function loadContinentMarkers() {
//     if (!map || !markerLayer) return;

//     markerLayer.clearLayers();

//     await Promise.all(CONTINENTS.map(async (continent) => {
//         try {
//             const count = await fetchContinentCount(continent);
//             if (count === 0) return;

//             const radius = Math.min(60, Math.max(15, Math.log10(count) * 10));

//             const marker = L.circleMarker([continent.lat, continent.lng], {
//                 radius,
//                 weight: 2,
//                 fillOpacity: 0.55
//             });

//             marker.bindTooltip(count.toLocaleString(), {
//                 permanent: true,
//                 direction: "center",
//                 className: "cluster-label"
//             });

//             marker.bindPopup(`<strong>${continent.name}</strong><br>${count.toLocaleString()} records`);

//             markerLayer.addLayer(marker);
//         } catch (error) {
//             console.error(`Failed to load ${continent.name}:`, error);
//         }
//     }));
// }

document.addEventListener("DOMContentLoaded", async () => {
    await loadStatsData();
    //initBreachMap();
});
