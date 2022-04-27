// Utils
import JoystickEmulator from './utils/JoystickEmulator';
import PageComponent from './components/PageComponent';

export default class App {
    constructor() {
        this._ui = {
            joystickEmulatorStick: document.querySelector('.js-joystick-emulator-stick'),
            page: document.querySelector('.js-page'),
        };

        this._joystickEmulator = this._createJoystickEmulator();
        this._pageComponent = this._createPageComponent();
    }

    /**
     * Private
     */
    _createJoystickEmulator() {
        const joystickEmulator = new JoystickEmulator({
            el: this._ui.joystickEmulatorStick,
            radius: 75,
        });

        return joystickEmulator;
    }

    _createPageComponent() {
        const pageComponent = new PageComponent({
            el: this._ui.page,
            joystick: this._joystickEmulator,
        });
        return pageComponent;
    }
}
