// ===============================
// EventBus (Observer centralizado)
// ===============================
export const EventBus = (function () {
    const events = {};

    function subscribe(event, callback) {
        if (!events[event]) events[event] = [];
        events[event].push(callback);
    }

    function publish(event, data) {
        if (!events[event]) return;
        events[event].forEach(callback => callback(data));
    }

    return {
        subscribe,
        publish
    };
})();