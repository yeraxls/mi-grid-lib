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
      direction: null // 'asc' | 'desc' | null
    };

    /* ======================
     * Data state
     * ====================== */
    this.originalData = [];
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
      this.currentData = [...this.originalData];
      this.currentPage = 1;
      this.renderTable(this.currentData);
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

    if (this.currentPage > totalPages)
      this.currentPage = totalPages;

    this.table.innerHTML = "";
    this.renderHeader();
    this.renderBody(this.getPagedData());
    this.renderFooter();
  }



  renderHeader() {
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");

    this.columns.forEach(col => {
      const th = document.createElement("th");
      th.textContent = col.label || col.field;

      if (col.sortable) {
        th.classList.add("grid-sortable");

        th.addEventListener("click", () => {
          this.toggleSort(col);
        });

        if (this.sortState.field === col.field) {
          th.classList.add("grid-sorted");
          th.classList.add(`grid-sort-${this.sortState.direction}`);
        }
      }

      tr.appendChild(th);
    });

    thead.appendChild(tr);
    this.table.appendChild(thead);
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
      this.currentData = [...this.originalData];
      this.currentPage = 1;
      this.renderTable();
      return;
    }

    const sorted = [...this.originalData].sort((a, b) => {
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

    this.currentData = sorted;
    this.currentPage = 1;
    this.renderTable();
  }

  /* ======================
   * Pagination
   * ====================== */
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
  getTotalPages() {
    if (!this.currentData || this.currentData.length === 0) return 1;
    return Math.ceil(this.currentData.length / this.pageSize);
  }

  getPagedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.currentData.slice(start, end);
  }

  createPaginationControls() {
    const wrapper = document.createElement("div");
    wrapper.className = "grid-pagination";

    const totalPages = this.getTotalPages();

    const prev = document.createElement("button");
    prev.textContent = "‹";
    prev.disabled = this.currentPage === 1;

    prev.addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderTable();
      }
    });

    const next = document.createElement("button");
    next.textContent = "›";
    next.disabled = this.currentPage === totalPages;

    next.addEventListener("click", () => {
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.renderTable();
      }
    });

    wrapper.append(prev, next);
    return wrapper;
  }


  createPageInfo() {
    const info = document.createElement("div");
    info.className = "grid-page-info";

    info.textContent = `Page ${this.currentPage} of ${this.getTotalPages()}`;
    return info;
  }


  renderPagination() {
    const old = this.container.querySelector(".grid-pagination");
    if (old) old.remove();

    const totalItems = this.currentData.length;
    const totalPages = Math.ceil(totalItems / this.pageSize);

    if (totalPages <= 1) return;

    const nav = document.createElement("div");
    nav.className = "grid-pagination";

    const prev = document.createElement("button");
    prev.textContent = "Prev";
    prev.disabled = this.currentPage === 1;
    prev.onclick = () => {
      this.currentPage--;
      this.renderTable();
    };

    const next = document.createElement("button");
    next.textContent = "Next";
    next.disabled = this.currentPage === totalPages;
    next.onclick = () => {
      this.currentPage++;
      this.renderTable();
    };

    const info = document.createElement("span");
    info.textContent = `Page ${this.currentPage} of ${totalPages}`;

    nav.append(prev, info, next);
    this.container.appendChild(nav);
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
