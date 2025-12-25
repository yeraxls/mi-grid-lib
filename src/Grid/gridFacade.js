import { DataGrid } from "./DataGrid.js";
import { registerGridApi } from "../Api/gridApi.js";
import { ThemeManager } from "../core/ThemeManager.js"
import { loadGridTheme } from "./gridStyleLoader.js";
import { GRID_THEMES } from "./GRID_THEMES.js";

export const MyGrid = (() => {
  
const BASE = new URL("./themes/", import.meta.url).href;

const GRID_STYLES = [
  `${BASE}base.css`,
  `${BASE}light.css`,
  `${BASE}dark.css`
];

let apiRegistered = false;

function ensureApi() {
  if (!apiRegistered) {
    registerGridApi();
    apiRegistered = true;
  }
}
  function create({ target, columns, data, url, mapResponse, theme = GRID_THEMES.LIGHT, }) {
    ensureApi();
    loadGridTheme(theme);
    
    const urlOptions = mapResponse ? { mapResponse } : {};
    if (theme)
      ThemeManager.setTheme(theme);
  
    return new DataGrid({ target, columns, data, url, urlOptions, theme });
  }

  function setTheme(theme) {
    ThemeManager.setTheme(theme);
  }

  return { create, setTheme };
})();
