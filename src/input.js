export class Input {
  constructor() {
    this.keys = {};
    this.justPressed = {};
    this._prev = {};

    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      e.preventDefault();
    });
    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
    });
  }

  update() {
    this.justPressed = {};
    for (const k in this.keys) {
      if (this.keys[k] && !this._prev[k]) this.justPressed[k] = true;
    }
    this._prev = { ...this.keys };
  }

  isDown(code) { return !!this.keys[code]; }
  wasPressed(code) { return !!this.justPressed[code]; }
}
