# My Grid Lib
[Back](./README.md)

- A lightweight JavaScript library to build data grids with support for:
- Local and remote data
- Event-driven architecture
- Theme system
- Modular design

---

## 📦 Installation

```html
<script type="module">
  import { MyGrid } from "./index.js";
</script>
```
## Use
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