export class DataGrid {
  constructor({ target, columns = [], dataSource }) {
    if (!target) {
      throw new Error("DataGrid requires a target");
    }

    if (!dataSource) {
      throw new Error("DataGrid requires a dataSource");
    }

    this.container =
      typeof target === "string"
        ? document.querySelector(target)
        : target;

    if (!this.container) {
      throw new Error("Target element not found");
    }

    this.columns = columns;
    this.dataSource = dataSource;

    this.table = document.createElement("table");
    this.table.className = "data-grid";

    this.container.innerHTML = "";
    this.container.appendChild(this.table);

    // Bind para poder desuscribir luego si hace falta
    this.onDataChange = this.onDataChange.bind(this);

    this.dataSource.subscribe(this.onDataChange);
    this.dataSource.load();
  }

  onDataChange(state) {
    if (state.loading) {
      this.renderLoading();
      return;
    }

    if (state.error) {
      this.renderError(state.error);
      return;
    }

    this.renderTable(state.data);
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

  destroy() {
    this.dataSource.unsubscribe(this.onDataChange);
    this.container.innerHTML = "";
  }
}
