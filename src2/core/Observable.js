export class Observable {
  constructor() {
    this.subscribers = new Set();
  }

  subscribe(callback) {
    if (typeof callback !== "function") {
      throw new Error("Subscriber must be a function");
    }
    this.subscribers.add(callback);
  }

  unsubscribe(callback) {
    this.subscribers.delete(callback);
  }

  notify(state) {
    this.subscribers.forEach(callback => {
      try {
        callback(state);
      } catch (err) {
        console.error("Subscriber error:", err);
      }
    });
  }
}
