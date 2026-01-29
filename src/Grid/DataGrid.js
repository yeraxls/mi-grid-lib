import { EventBus } from "../core/EventBus.js";
import { GRID_EVENTS } from "./GRID_EVENTS.js";
import { ThemeManager } from "../core/ThemeManager.js";

export class DataGrid {
  constructor({
    target,
    columns = [],
    data,
    url,
    urlOptions = {},
    theme,
    onRowClick,
    onSort,
    pageSize = 10,
    pageSizeOptions = [5, 10, 20, 50]
  }) {
    this.columns = columns;
    this.url = url;
    this.urlOptions = urlOptions;
    this.onRowClick = onRowClick;
    this.onSort = onSort;

    /* ======================
     * Sorting state
     * ====================== */
    this.sortState = {
      field: null,
      direction: null
    };

    /* ======================
     * Filter state
     * ====================== */
    this.columnFilters = {};

    /* ======================
     * Data state
     * ====================== */
    this.originalData = [];
    this.filteredData = [];
    this.currentData = [];

    /* ======================
     * Pagination state
     * ====================== */
    this.pageSize = pageSize;
    this.pageSizeOptions = pageSizeOptions;
    this.currentPage = 1;

    /* ======================
     * Container
     * ====================== */
    this.container =
      typeof target === "string"
        ? document.querySelector(target)
        : target;

    if (!this.container) {
      throw new Error("Target element not found");
    }

    if (theme) {
      ThemeManager.setTheme(theme);
    }

    this.container.classList.add("my-grid");
    ThemeManager.applyTheme(this.container);

    /* ======================
     * Table
     * ====================== */
    this.table = document.createElement("table");
    this.table.className = "data-grid";
    this.container.innerHTML = "";
    this.container.appendChild(this.table);

    /* ======================
     * Events
     * ====================== */
    EventBus.subscribe(GRID_EVENTS.LOADING, () => this.renderLoading());

    EventBus.subscribe(GRID_EVENTS.DATA_LOADED, data => {
      this.originalData = Array.isArray(data) ? data : [];
      this.applyFilters();
    });

    EventBus.subscribe(GRID_EVENTS.DATA_ERROR, error =>
      this.renderError(error)
    );

    /* ======================
     * Init
     * ====================== */
    if (data && url) {
      this.renderState("Provide either data or url, not both");
      return;
    }

    if (data) {
      EventBus.publish(GRID_EVENTS.DATA_LOADED, data);
      return;
    }

    if (url) {
      EventBus.publish(GRID_EVENTS.REQUEST_DATA, {
        url,
        options: urlOptions
      });
      return;
    }

    throw new Error("DataGrid requires data or url");
  }

  /* ======================
   * Rendering states
   * ====================== */
  renderLoading() {
    this.table.innerHTML = `
      <tbody>
        <tr class="grid-state loading">
          <td colspan="${this.columns.length || 1}">
            <div class="grid-loading">
              <span class="spinner"></span>
              Loading...
            </div>
          </td>
        </tr>
      </tbody>
    `;
  }

  renderError(error) {
    const message =
      error?.message ||
      error?.error ||
      error ||
      "Error loading data";

    this.renderState(`Error: ${message}`);
  }

  renderState(message) {
    const colSpan = this.columns.length || 1;

    this.table.innerHTML = `
      <tbody>
        <tr class="grid-state">
          <td colspan="${colSpan}">
            ${message}
          </td>
        </tr>
      </tbody>
    `;
  }

  /* ======================
   * Main render
   * ====================== */
  renderTable() {
    const totalPages = this.getTotalPages();
    if (this.currentPage > totalPages) this.currentPage = totalPages;

    this.table.innerHTML = "";
    this.renderColGroup()
    this.renderHeader();
    this.renderBody(this.getPagedData());
    this.renderFooter();
  }

    /* ======================
   * ColGroup
   * ====================== */
  renderColGroup() {
    const colgroup = document.createElement("colgroup");

    this.columns.forEach(col => {
      const colEl = document.createElement("col");

      if (col.width) colEl.style.width = col.width;
      if (col.minWidth) colEl.style.minWidth = col.minWidth;
      if (col.maxWidth) colEl.style.maxWidth = col.maxWidth;

      colgroup.appendChild(colEl);
    });

    this.table.appendChild(colgroup);
  }

  /* ======================
   * Header
   * ====================== */
  renderHeader() {
    const thead = document.createElement("thead");

    /* Header labels */
    const headerRow = document.createElement("tr");

    this.columns.forEach(col => {
      const th = document.createElement("th");
      th.textContent = col.label || col.field;

      if (col.sortable) {
        th.classList.add("grid-sortable");
        th.addEventListener("click", () => this.toggleSort(col));

        if (this.sortState.field === col.field) {
          th.classList.add("grid-sorted");
          th.classList.add(`grid-sort-${this.sortState.direction}`);
        }
      }

      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    /* Filter row */
    const filterRow = document.createElement("tr");
    filterRow.className = "grid-filter-row";

    this.columns.forEach(col => {
      const th = document.createElement("th");

      if (col.filterable && col.filterable !== false) {
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Filter...";
        input.value = this.columnFilters[col.field] || "";

        input.addEventListener("input", e => {
          this.columnFilters[col.field] = e.target.value;
          this.currentPage = 1;
          this.applyFilters();
        });

        th.appendChild(input);
      }

      filterRow.appendChild(th);
    });

    thead.appendChild(filterRow);
    this.table.appendChild(thead);
  }

  /* ======================
   * Filtering
   * ====================== */
  applyFilters() {
    this.filteredData = this.originalData.filter(row =>
      this.columns.every(col => {
        const filterValue = this.columnFilters[col.field];
        if (!filterValue) return true;

        const cellValue = row[col.field];
        return String(cellValue ?? "")
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      })
    );

    this.applySorting();
  }

  /* ======================
   * Sorting
   * ====================== */
  toggleSort(col) {
    const field = col.field;

    if (this.sortState.field !== field) {
      this.sortState = { field, direction: "asc" };
    } else if (this.sortState.direction === "asc") {
      this.sortState.direction = "desc";
    } else {
      this.sortState = { field: null, direction: null };
    }

    if (typeof this.onSort === "function") {
      this.onSort(this.sortState.field, this.sortState.direction);
    }

    this.applySorting();
  }

  applySorting() {
    const { field, direction } = this.sortState;

    if (!field || !direction) {
      this.currentData = [...this.filteredData];
      this.renderTable();
      return;
    }

    this.currentData = [...this.filteredData].sort((a, b) => {
      const A = a[field];
      const B = b[field];

      if (A == null && B == null) return 0;
      if (A == null) return direction === "asc" ? -1 : 1;
      if (B == null) return direction === "asc" ? 1 : -1;

      if (typeof A === "number" && typeof B === "number") {
        return direction === "asc" ? A - B : B - A;
      }

      return direction === "asc"
        ? String(A).localeCompare(String(B))
        : String(B).localeCompare(String(A));
    });

    this.renderTable();
  }

  /* ======================
   * Pagination
   * ====================== */
  getTotalPages() {
    if (!this.currentData || this.currentData.length === 0) return 1;
    return Math.ceil(this.currentData.length / this.pageSize);
  }

  getPagedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.currentData.slice(start, end);
  }

  createPageSizeSelector() {
    const wrapper = document.createElement("div");
    wrapper.className = "grid-page-size";

    const label = document.createElement("label");
    label.textContent = "Rows:";

    const select = document.createElement("select");

    this.pageSizeOptions.forEach(size => {
      const option = document.createElement("option");
      option.value = size;
      option.textContent = size;
      if (size === this.pageSize) option.selected = true;
      select.appendChild(option);
    });

    select.addEventListener("change", () => {
      this.pageSize = Number(select.value);
      this.currentPage = 1;
      this.renderTable();
    });

    wrapper.append(label, select);
    return wrapper;
  }

  renderFooter() {
    const oldFooter = this.container.querySelector(".grid-footer");
    if (oldFooter) oldFooter.remove();

    const footer = document.createElement("div");
    footer.className = "grid-footer";

    footer.appendChild(this.createPaginationControls());
    footer.appendChild(this.createPageInfo());
    footer.appendChild(this.createPageSizeSelector());

    this.container.appendChild(footer);
  }

  createPaginationControls() {
    const wrapper = document.createElement("div");
    wrapper.className = "grid-pagination";

    const totalPages = this.getTotalPages();

    const prev = document.createElement("button");
    prev.textContent = "‹";
    prev.disabled = this.currentPage === 1;
    prev.onclick = () => {
      this.currentPage--;
      this.renderTable();
    };

    const next = document.createElement("button");
    next.textContent = "›";
    next.disabled = this.currentPage === totalPages;
    next.onclick = () => {
      this.currentPage++;
      this.renderTable();
    };

    wrapper.append(prev, next);
    return wrapper;
  }

  createPageInfo() {
    const info = document.createElement("div");
    info.className = "grid-page-info";
    info.textContent = `Page ${this.currentPage} of ${this.getTotalPages()}`;
    return info;
  }

  /* ======================
   * Body
   * ====================== */
  renderEmpty() {
    this.renderState("No data available");
  }

  renderBody(data) {
    if (!data || data.length === 0) {
      this.renderEmpty();
      return;
    }

    const tbody = document.createElement("tbody");

    data.forEach(row => {
      const tr = this.createRow(row);
      tbody.appendChild(tr);
    });

    this.table.appendChild(tbody);
  }

  createRow(row) {
    const tr = document.createElement("tr");

    if (typeof this.onRowClick === "function") {
      tr.classList.add("grid-row-clickable");
      tr.addEventListener("click", event =>
        this.onRowClick(row, event)
      );
    }

    this.columns.forEach(col => {
      tr.appendChild(this.createCell(col, row));
    });

    return tr;
  }

  createCell(col, row) {
    const td = document.createElement("td");
    const value = row[col.field];

    if (typeof col.render === "function") {
      const rendered = col.render(value, row);
      if (rendered instanceof HTMLElement) {
        td.appendChild(rendered);
      } else {
        td.textContent = rendered ?? "";
      }
    } else {
      td.textContent = value ?? "";
    }

    return td;
  }
}
