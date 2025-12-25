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

    ThemeManager.applyTheme(this.container);

    this.table = document.createElement("table");
    this.table.className = "data-grid";
    this.container.innerHTML = "";
    this.container.appendChild(this.table);

    // Subscribirse a eventos
    EventBus.subscribe(GRID_EVENTS.LOADING, () => this.renderLoading());
    EventBus.subscribe(GRID_EVENTS.DATA_LOADED, data => this.renderTable(data));
    EventBus.subscribe(GRID_EVENTS.DATA_ERROR, error => this.renderError(error));

    // 🔹 Dataset directo → publica evento
    if (data) {
      EventBus.publish(GRID_EVENTS.DATA_LOADED, data);
      return;
    }

    // 🔹 URL → solicita datos
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
        <tr>
          <td colspan="${this.columns.length}">
            Loading...
          </td>
        </tr>
      </tbody>
    `;
  }

  renderError(error) {
    this.table.innerHTML = `
      <tbody>
        <tr>
          <td colspan="${this.columns.length}">
            Error: ${error.message}
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
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");

    this.columns.forEach(col => {
      const th = document.createElement("th");
      th.textContent = col.label || col.field;
      tr.appendChild(th);
    });

    thead.appendChild(tr);
    this.table.appendChild(thead);
  }

  renderBody(data) {
    const tbody = document.createElement("tbody");

    if (!data || data.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = this.columns.length;
      td.textContent = "No data";
      tr.appendChild(td);
      tbody.appendChild(tr);
    } else {
      data.forEach(row => {
        const tr = document.createElement("tr");

        this.columns.forEach(col => {
          const td = document.createElement("td");
          td.textContent = row[col.field];
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });
    }

    this.table.appendChild(tbody);
  }
}
