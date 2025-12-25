export const ThemeManager = (() => {
  let currentTheme = "light";

  function setTheme(theme) {
    currentTheme = theme;
  }

  function applyTheme(element) {
    element.classList.add("my-grid");
    element.classList.add(`theme-${currentTheme}`);
  }

  return {
    setTheme,
    applyTheme
  };
})();
