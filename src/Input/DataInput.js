class MyInput {
  constructor({ target }) {
    this.el = document.querySelector(target);
    this.el.classList.add("my-input");
    ThemeManager.applyTheme(this.el);
  }
}

///TO DO