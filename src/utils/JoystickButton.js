export default class JoystickButton {
    constructor(options = {}) {
        this._el = options.el;
        this._bounds = options.bounds;
        this._isFocused = options.isFocused;
        this._isTargeted = options.isTargeted;
        this._position = { x: this._bounds.x, y: this._bounds.y };
    }

    /**
     * Getters
     */
    get el() {
        return this._el;
    }

    get bounds() {
        return this._bounds;
    }

    get isFocused() {
        return this._isFocused;
    }

    set isFocused(isFocused) {
        this._isFocused = isFocused;

        if (isFocused) {
            this._el.focus();
            if (!this._el.classList.contains('focus')) this._el.classList.add('focus');
        } else {
            if (this._el.classList.contains('focus')) this._el.classList.remove('focus');
        }
    }

    get isTargeted() {
        return this._isTargeted;
    }

    set isTargeted(isTargeted) {
        this._isTargeted = isTargeted;

        if (isTargeted) {
            if (!this._el.classList.contains('hover')) this._el.classList.add('hover');
        } else {
            if (this._el.classList.contains('hover')) this._el.classList.remove('hover');
        }
    }

    get position() {
        return this._position;
    }
}
