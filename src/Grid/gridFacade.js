import { DataGrid } from "./DataGrid.js";
import { registerGridApi } from "../Api/gridApi.js";
import { ThemeManager } from "../core/ThemeManager.js";
import { loadGridTheme } from "./gridStyleLoader.js";
import { GRID_THEMES } from "./GRID_THEMES.js";

export const MyGrid = (() => {
  let apiRegistered = false;

  function ensureApi() {
    if (!apiRegistered) {
      registerGridApi();
      apiRegistered = true;
    }
  }

  function create({
    target,
    columns,
    data,
    url,
    mapResponse,
    theme = GRID_THEMES.LIGHT,
    onRowClick
  }) {
    ensureApi();

    loadGridTheme(theme);
    ThemeManager.setTheme(theme);

    const urlOptions = mapResponse ? { mapResponse } : {};

    return new DataGrid({
      target,
      columns,
      data,
      url,
      urlOptions,
      onRowClick
    });
  }

  function setTheme(theme) {
    loadGridTheme(theme);
    ThemeManager.setTheme(theme);
  }

  return { create, setTheme };
})();
