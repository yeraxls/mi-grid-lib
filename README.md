Readme
# My Grid Lib

A lightweight JavaScript grid library with theming, events and remote data support.

📘 **Documentation**
- [Español](./README.es.md)
- [English](./README.en.md)

## 📦 Installation

```html
<script type="module">
  import { MyGrid, GRID_THEMES } from "./useComponents.js";
</script>

```
## Use
```html
<script type="module">
import { MyGrid, GRID_THEMES } from "./useComponents.js";

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