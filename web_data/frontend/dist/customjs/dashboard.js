let map = null;
let markerLayer = null;
let mapFetchTimeout = null;
let activeMapRequestId = 0;

const MAP_LIMIT = 5000;
const breachColors = {};

const STATS_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

function formatStatsAge(fetchedAt) {
    const ageMs = Date.now() - fetchedAt;
    const minutes = Math.floor(ageMs / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
}

async function getTopStatsData() {
    try {
        const response = await fetch("/api/leaklense/stats");

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "success") {
            localStorage.setItem("stats", JSON.stringify({ data: data.data, fetchedAt: Date.now() }));
            return { data: data.data, fetchedAt: Date.now() };
        }

        return null;
    } catch (error) {
        console.error("Request failed:", error);
        return null;
    }
}

async function loadStatsData() {
    let statsData = null;
    let fetchedAt = null;

    const cachedStats = localStorage.getItem("stats");

    if (cachedStats) {
        try {
            const parsed = JSON.parse(cachedStats);
            // Support both old format (raw data) and new format ({data, fetchedAt})
            if (parsed && parsed.fetchedAt) {
                if (Date.now() - parsed.fetchedAt < STATS_MAX_AGE_MS) {
                    statsData = parsed.data;
                    fetchedAt = parsed.fetchedAt;
                } else {
                    localStorage.removeItem("stats");
                }
            } else {
                // Old cache format without timestamp — treat as stale
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

    if (!statsData) {
        return;
    }

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

// ─── Invoice table ────────────────────────────────────────────────────────────

const invoiceData = [
    { no: "001401", subject: "Design Works",         flag: "us", client: "Carlson Limited", vat: "87956621", created: "15 Dec 2017", createdMs: new Date("2017-12-15").getTime(), statusBadge: "bg-success",   status: "Paid",            price: 887  },
    { no: "001402", subject: "UX Wireframes",         flag: "gb", client: "Adobe",           vat: "87956421", created: "12 Apr 2017", createdMs: new Date("2017-04-12").getTime(), statusBadge: "bg-warning",   status: "Pending",         price: 1200 },
    { no: "001403", subject: "New Dashboard",         flag: "de", client: "Bluewolf",        vat: "87952621", created: "23 Oct 2017", createdMs: new Date("2017-10-23").getTime(), statusBadge: "bg-warning",   status: "Pending",         price: 534  },
    { no: "001404", subject: "Landing Page",          flag: "br", client: "Salesforce",      vat: "87953421", created: "2 Sep 2017",  createdMs: new Date("2017-09-02").getTime(), statusBadge: "bg-secondary", status: "Due in 2 Weeks",  price: 1500 },
    { no: "001405", subject: "Marketing Templates",   flag: "pl", client: "Printic",         vat: "87956621", created: "29 Jan 2018", createdMs: new Date("2018-01-29").getTime(), statusBadge: "bg-danger",    status: "Paid Today",      price: 648  },
    { no: "001406", subject: "Sales Presentation",    flag: "br", client: "Tabdaq",          vat: "87956621", created: "4 Feb 2018",  createdMs: new Date("2018-02-04").getTime(), statusBadge: "bg-secondary", status: "Due in 3 Weeks",  price: 300  },
    { no: "001407", subject: "Logo & Print",          flag: "us", client: "Apple",           vat: "87956621", created: "22 Mar 2018", createdMs: new Date("2018-03-22").getTime(), statusBadge: "bg-success",   status: "Paid Today",      price: 2500 },
    { no: "001408", subject: "Icons",                 flag: "pl", client: "Tookapic",        vat: "87956621", created: "13 May 2018", createdMs: new Date("2018-05-13").getTime(), statusBadge: "bg-success",   status: "Paid Today",      price: 940  },
];

const tableState = {
    search: "",
    sortCol: "no",
    sortDir: "asc",
    page: 1,
    pageSize: 8,
};

function getFilteredSorted() {
    let rows = invoiceData.filter(row => {
        if (!tableState.search) return true;
        const q = tableState.search.toLowerCase();
        return (
            row.no.toLowerCase().includes(q) ||
            row.subject.toLowerCase().includes(q) ||
            row.client.toLowerCase().includes(q) ||
            row.vat.toLowerCase().includes(q) ||
            row.created.toLowerCase().includes(q) ||
            row.status.toLowerCase().includes(q) ||
            String(row.price).includes(q)
        );
    });

    rows = rows.slice().sort((a, b) => {
        let aVal = tableState.sortCol === "created" ? a.createdMs : a[tableState.sortCol];
        let bVal = tableState.sortCol === "created" ? b.createdMs : b[tableState.sortCol];
        if (typeof aVal === "number") {
            return tableState.sortDir === "asc" ? aVal - bVal : bVal - aVal;
        }
        return tableState.sortDir === "asc"
            ? String(aVal).localeCompare(String(bVal))
            : String(bVal).localeCompare(String(aVal));
    });

    return rows;
}

function updateSortIcons() {
    document.querySelectorAll("th[data-sort]").forEach(th => {
        const icon = th.querySelector(".sort-icon");
        if (!icon) return;
        if (th.dataset.sort === tableState.sortCol) {
            icon.style.opacity = "1";
            icon.style.transform = tableState.sortDir === "desc" ? "rotate(180deg)" : "rotate(0deg)";
        } else {
            icon.style.opacity = "0.3";
            icon.style.transform = "rotate(0deg)";
        }
    });
}

function renderPagination(el, totalPages) {
    const current = tableState.page;
    let startPage = Math.max(1, current - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

    const pages = [];
    for (let i = startPage; i <= endPage; i++) pages.push(i);

    const chevLeft  = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-1"><path d="M15 6l-6 6l6 6"></path></svg>`;
    const chevRight = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-1"><path d="M9 6l6 6l-6 6"></path></svg>`;

    el.innerHTML = `
        <li class="page-item ${current === 1 ? "disabled" : ""}">
            <a class="page-link" href="#" data-page="${current - 1}" tabindex="-1">${chevLeft}</a>
        </li>
        ${pages.map(p => `<li class="page-item ${p === current ? "active" : ""}"><a class="page-link" href="#" data-page="${p}">${p}</a></li>`).join("")}
        <li class="page-item ${current === totalPages ? "disabled" : ""}">
            <a class="page-link" href="#" data-page="${current + 1}">${chevRight}</a>
        </li>
    `;

    el.querySelectorAll("[data-page]").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const p = parseInt(link.dataset.page);
            const rows = getFilteredSorted();
            const pages = Math.max(1, Math.ceil(rows.length / tableState.pageSize));
            if (p >= 1 && p <= pages) {
                tableState.page = p;
                renderInvoiceTable();
            }
        });
    });
}

function renderInvoiceTable() {
    const tbody     = document.getElementById("invoice-tbody");
    const infoEl    = document.getElementById("table-info");
    const pagEl     = document.getElementById("table-pagination");
    if (!tbody) return;

    const rows      = getFilteredSorted();
    const total     = rows.length;
    const totalPages = Math.max(1, Math.ceil(total / tableState.pageSize));
    if (tableState.page > totalPages) tableState.page = totalPages;

    const start     = (tableState.page - 1) * tableState.pageSize;
    const pageRows  = rows.slice(start, start + tableState.pageSize);

    tbody.innerHTML = pageRows.map(row => `
        <tr>
            <td><span class="text-secondary">${row.no}</span></td>
            <td><a href="invoice.html" class="text-reset" tabindex="-1">${row.subject}</a></td>
            <td><span class="flag flag-xs flag-country-${row.flag} me-2"></span>${row.client}</td>
            <td>${row.vat}</td>
            <td>${row.created}</td>
            <td><span class="badge ${row.statusBadge} me-1"></span> ${row.status}</td>
            <td>$${row.price.toLocaleString()}</td>
            <td class="text-end">
                <span class="dropdown">
                    <button class="btn dropdown-toggle align-text-top" data-bs-boundary="viewport" data-bs-toggle="dropdown" aria-expanded="false">Actions</button>
                    <div class="dropdown-menu dropdown-menu-end">
                        <a class="dropdown-item" href="#">Action</a>
                        <a class="dropdown-item" href="#">Another action</a>
                    </div>
                </span>
            </td>
        </tr>
    `).join("");

    if (infoEl) {
        if (total === 0) {
            infoEl.innerHTML = "No entries found";
        } else {
            const showEnd = Math.min(start + tableState.pageSize, total);
            infoEl.innerHTML = `Showing <strong>${start + 1} to ${showEnd}</strong> of <strong>${total} entries</strong>`;
        }
    }

    if (pagEl) renderPagination(pagEl, totalPages);

    updateSortIcons();
}

function initInvoiceTable() {
    const searchInput  = document.getElementById("table-search");
    const entriesInput = document.getElementById("table-entries");

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            tableState.search = searchInput.value;
            tableState.page = 1;
            renderInvoiceTable();
        });
    }

    if (entriesInput) {
        entriesInput.addEventListener("change", () => {
            const val = parseInt(entriesInput.value);
            if (val > 0) {
                tableState.pageSize = val;
                tableState.page = 1;
                renderInvoiceTable();
            }
        });
    }

    document.querySelectorAll("th[data-sort]").forEach(th => {
        th.addEventListener("click", () => {
            const col = th.dataset.sort;
            if (tableState.sortCol === col) {
                tableState.sortDir = tableState.sortDir === "asc" ? "desc" : "asc";
            } else {
                tableState.sortCol = col;
                tableState.sortDir = "asc";
            }
            renderInvoiceTable();
        });
    });

    renderInvoiceTable();
}

// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
    await loadStatsData();
    initInvoiceTable();
});
