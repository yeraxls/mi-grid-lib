import { Observable } from "../core/Observable.js";

export class ArrayDataSource extends Observable {
  constructor(data = []) {
    super();

    if (!Array.isArray(data)) {
      throw new Error("ArrayDataSource expects an array");
    }

    this.state = {
      data,
      loading: false,
      error: null
    };
  }

  load() {
    // No async, pero respetamos el contrato
    this.notify(this.state);
  }

  setData(data) {
    if (!Array.isArray(data)) {
      throw new Error("setData expects an array");
    }

    this.state.data = data;
    this.notify(this.state);
  }

  getData() {
    return this.state.data;
  }
}
