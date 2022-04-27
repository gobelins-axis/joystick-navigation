// Utils
import JoystickButtonManager from '../utils/JoystickButtonManager';

export default class PageComponent {
    constructor(options = {}) {
        this._el = options.el;
        this._joystick = options.joystick;

        this._buttons = this._el.querySelectorAll('[data-button]');
        this._joystickButtonManager = this._createJoystickButtonManager();
    }

    /**
     * Private
     */
    _createJoystickButtonManager() {
        const joystickButtonManager = new JoystickButtonManager({
            name: 'Page',
            joystick: this._joystick,
        });

        joystickButtonManager.add(this._buttons);

        return joystickButtonManager;
    }
}
