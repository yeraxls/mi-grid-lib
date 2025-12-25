import { Observable } from "../core/Observable.js";

export class UrlDataSource extends Observable {
  constructor({ url, method = "GET", headers = {}, mapResponse }) {
    super();

    if (!url) {
      throw new Error("UrlDataSource requires a url");
    }

    this.url = url;
    this.method = method;
    this.headers = headers;
    this.mapResponse = mapResponse;

    this.state = {
      data: [],
      loading: false,
      error: null
    };
  }

  async load() {
    this.state.loading = true;
    this.state.error = null;
    this.notify(this.state);

    try {
      const response = await fetch(this.url, {
        method: this.method,
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      let data = await response.json();

      // Permite adaptar respuestas tipo { items, total }
      if (typeof this.mapResponse === "function") {
        data = this.mapResponse(data);
      }

      this.state.data = data;
    } catch (error) {
      this.state.error = error;
      this.state.data = [];
    } finally {
      this.state.loading = false;
      this.notify(this.state);
    }
  }

  reload() {
    return this.load();
  }
}

/*
permite adaptarse a apis reales
new UrlDataSource({
  url: "/api/users",
  mapResponse: res => res.items
});

*/
