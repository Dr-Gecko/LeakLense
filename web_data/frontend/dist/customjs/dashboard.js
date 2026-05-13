let map = null;
let markerLayer = null;
let mapFetchTimeout = null;
let activeMapRequestId = 0;

const MAP_LIMIT = 5000;
const breachColors = {};


async function getTopStatsData(){
    try {
        const response = await fetch("/api/leaklense/stats");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.status === "success" ? data.data : null;
    } catch (error) {
        console.error("Request failed:", error);
        return null;
    }
}

async function loadStatsData(){
    const stats_data = await getTopStatsData();
    if (document.getElementById("records_count")) {
        document.getElementById("records_count").innerHTML =
            `${Number(stats_data.total_entries).toLocaleString()} records stored`;
    }

    if (document.getElementById("breaches_count")) {
        document.getElementById("breaches_count").innerHTML =
            `${Number(stats_data.breaches).toLocaleString()} breaches monitored`;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    loadStatsData()
});