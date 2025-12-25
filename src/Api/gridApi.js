import { httpService } from '../core/httpService.js';
import { EventBus } from "../core/EventBus.js";
import { GRID_EVENTS } from "../Grid/GRID_EVENTS.js";

export function registerGridApi() {
  EventBus.subscribe(GRID_EVENTS.REQUEST_DATA, async ({ url, options }) => {
    EventBus.publish(GRID_EVENTS.LOADING);

    try {
      const response = await httpService.get(url);

      if (!response.success) {
        throw new Error(`HTTP ${response.status}`);
      }

      // ⚡ Usar directamente response.data
      let data = response.data;

      if (typeof options?.mapResponse === "function") {
        data = options.mapResponse(data);
      }

      EventBus.publish(GRID_EVENTS.DATA_LOADED, data);
    } catch (error) {
      EventBus.publish(GRID_EVENTS.DATA_ERROR, error);
    }
  });
}
