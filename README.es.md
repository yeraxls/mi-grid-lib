# My Grid Lib
[Volver](./README.md)

- Librería JavaScript ligera para crear grids de datos con soporte para:
- Datos locales o remotos
- Sistema de eventos
- Temas (themes)
- Arquitectura modular

---

## 📦 Instalación

```html
<script type="module">
  import { MyGrid } from "./index.js";
</script>

```
## Uso
```html
<script type="module">
import { MyGrid, GRID_THEMES } from "./index.js";

MyGrid.create({
  target: "#grid",
  theme: GRID_THEMES.DARK,
  columns: [
    { field: "name", label: "Nombre" },
    { field: "url", label: "URL" }
  ],
  url: "https://pokeapi.co/api/v2/pokemon",
  mapResponse: res => res.results
});
</script>
```