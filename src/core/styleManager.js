const loaded = new Set();

export const StyleManager = {
  loadOnce(href) {
    if (loaded.has(href)) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;

    document.head.appendChild(link);
    loaded.add(href);
  }
};
