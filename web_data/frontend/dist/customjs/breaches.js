window.tabler_list = window.tabler_list || {};

document.addEventListener("DOMContentLoaded", () => {
  const tableId = "advanced-table";

  if (typeof List === "undefined") {
    console.error("List.js is not loaded. Load list.min.js before this script.");
    return;
  }

  const tableElement = document.getElementById(tableId);

  if (!tableElement) {
    console.error(`#${tableId} was not found.`);
    return;
  }

  const list = new List(tableId, {
    sortClass: "table-sort",
    listClass: "table-tbody",
    page: 20,
    pagination: {
      item: (value) => {
        return `
          <li class="page-item">
            <a class="page-link cursor-pointer">${value.page}</a>
          </li>
        `;
      },
      innerWindow: 1,
      outerWindow: 1,
      left: 0,
      right: 0,
    },
    valueNames: [
      "sort-name",
      "sort-city",
      "sort-status",
      "sort-date",
      "sort-tags",
      "sort-category",
    ],
  });

  window.tabler_list[tableId] = list;

  const searchInput = document.getElementById("advanced-table-search");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      list.search(searchInput.value);
    });
  }

  const pageCount = document.getElementById("page-count");

  document.querySelectorAll("[data-value]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const value = parseInt(event.currentTarget.dataset.value, 10);

      if (Number.isNaN(value)) return;

      list.page = value;
      list.update();

      if (pageCount) {
        pageCount.textContent = value;
      }
    });
  });
});