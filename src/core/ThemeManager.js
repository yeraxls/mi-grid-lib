export const ThemeManager = (() => {
  let currentTheme = "light";

  function setTheme(theme) {
    currentTheme = theme;
  }

  function applyTheme(element) {
    if (!element) return;

    // Limpiar temas anteriores
    [...element.classList]
      .filter(cls => cls.startsWith("theme-"))
      .forEach(cls => element.classList.remove(cls));

    // Aplicar tema actual
    element.classList.add(`theme-${currentTheme}`);
  }

  return {
    setTheme,
    applyTheme
  };
})();
