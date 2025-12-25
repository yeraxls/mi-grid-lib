import { StyleManager } from "../core/styleManager.js";
import { GRID_THEME_CSS } from "./gridThemesMap.js";
const BASE = new URL("./themes/", import.meta.url).href;

export function loadGridTheme(theme) {
  // base siempre
  StyleManager.loadOnce(`${BASE}base.css`);

  const cssFile = GRID_THEME_CSS[theme];
  if (!cssFile) {
    throw new Error(`Grid theme "${theme}" no soportado`);
  }

  StyleManager.loadOnce(`${BASE}${cssFile}`);
}