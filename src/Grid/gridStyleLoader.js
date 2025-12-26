import { StyleManager } from "../core/styleManager.js";
import { GRID_THEME_CSS } from "./gridThemesMap.js";
const BASE = new URL("./themes/", import.meta.url).href;

export function loadGridTheme(theme) {
  StyleManager.loadOnce(`${BASE}base.css`);

  const cssFile = GRID_THEME_CSS[theme];
  if (!cssFile) {
    console.warn(`Grid theme "${theme}" no soportado`);
    return;
  }

  StyleManager.loadOnce(`${BASE}${cssFile}`);
}
