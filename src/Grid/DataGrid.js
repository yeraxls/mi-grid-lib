import { EventBus } from "../core/EventBus.js";
import { GRID_EVENTS } from "./GRID_EVENTS.js";
import { ThemeManager } from "../core/ThemeManager.js";

export class DataGrid {
  constructor({ target, columns = [], data, url, urlOptions = {}, theme }) {
    this.columns = columns;
    this.url = url;
    this.urlOptions = urlOptions;

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


    this.table = document.createElement("table");
    this.table.className = "data-grid";
    this.container.innerHTML = "";
    this.container.appendChild(this.table);

    EventBus.subscribe(GRID_EVENTS.LOADING, () => this.renderLoading());
    EventBus.subscribe(GRID_EVENTS.DATA_LOADED, data => this.renderTable(data));
    EventBus.subscribe(GRID_EVENTS.DATA_ERROR, error => this.renderError(error));

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

  renderTable(data) {
    this.table.innerHTML = "";
    this.renderHeader();
    this.renderBody(data);
  }

  renderHeader() {
    const colsNum = 100/this.columns.length
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");

    this.columns.forEach(col => {
      const th = document.createElement("th");
      th.textContent = col.label || col.field;
      th.style.width = `${colsNum}%`
      tr.appendChild(th);
    });

    thead.appendChild(tr);
    this.table.appendChild(thead);
  }

  renderEmpty() {
    this.renderState("No data available");
  }

  renderBody(data) {
    if (!data || data.length === 0) {
      this.renderEmpty()
      return;
    }

    const tbody = document.createElement("tbody");
    data.forEach(row => {
      const tr = document.createElement("tr");

      this.columns.forEach(col => {
        const td = document.createElement("td");
        td.textContent = row[col.field];
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    this.table.appendChild(tbody);
  }
}
