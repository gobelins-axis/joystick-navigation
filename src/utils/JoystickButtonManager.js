// Utils
import Ray from './Ray';
import degToRad from './math/degToRad';
import JoystickButton from './JoystickButton';

const RAYS_AMOUNT = 10;
const RAYS_RANGE = 20; // DEGREES

export default class JoystickButtonManager {
    constructor(options = {}) {
        this._name = options.name;
        this._buttons = options.buttons || [];
        this._joystick = options.joystick;

        this._targetedJoystickButton = null;
        this._focusedJoystickButton = null;
        this._focusPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this._joystickPosition = { x: 0, y: 0 };
        this._joystickAngle = 0;

        this._joystickButtons = this._createJoystickButtons();
        this._rays = this._createRays();

        this._bindAll();
        this._setupEventListeners();
    }

    /**
     * Getters
     */
    get buttons() {
        return this._buttons;
    }

    get joystickButtons() {
        return this._joystickButtons;
    }

    /**
     * Public
     */
    update() {
        this._joystickButtons = this._createJoystickButtons();
    }

    destroy() {
        this._removeEventListeners();

        this._buttons = [];
        this._joystickButtons = [];
    }

    add(buttons) {
        for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i];
            this._buttons.push(button);
        }

        this._joystickButtons = this._createJoystickButtons();
    }

    /**
     * Private
     */
    _createJoystickButtons() {
        const joystickButtons = [];

        for (let i = 0; i < this._buttons.length; i++) {
            const el = this._buttons[i];
            const bounds = el.getBoundingClientRect();
            const joystickButton = new JoystickButton({
                el,
                bounds,
                isFocused: false,
                isTargeted: false,
            });
            joystickButtons.push(joystickButton);
        }

        return joystickButtons;
    }

    _createRays() {
        const rays = [];

        const offsetAngle = RAYS_RANGE / (RAYS_AMOUNT - 1);

        let evenIndex = 0;
        for (let i = 0; i < RAYS_AMOUNT; i++) {
            const even = i % 2 === 0;
            const rayAngle = this._joystickAngle + degToRad(offsetAngle * evenIndex * (even ? -1 : 1));
            const ray = new Ray({
                priority: 1 - evenIndex / RAYS_AMOUNT,
                position: this._focusPosition,
                direction: this._joystickPosition,
                angle: rayAngle,
            });
            rays.push(ray);
            if (even) evenIndex++;
        }

        return rays;
    }

    _getTargetedButton() {
        const intersections = this._getIntersections(this._focusPosition, this._joystickAngle);

        if (intersections.length === 0) return;

        let bestRanking = Infinity;
        let bestIntersection = null;

        for (let i = 0; i < intersections.length; i++) {
            const intersection = intersections[i];
            const ranking = intersection.distance * (1 - intersection.priority);

            if (ranking < bestRanking) {
                bestRanking = ranking;
                bestIntersection = intersection;
            }
        }

        return bestIntersection.target;
    }

    _getIntersections(position, angle) {
        const intersections = [];
        const offsetAngle = RAYS_RANGE / (RAYS_AMOUNT - 1);

        let evenIndex = 0;
        for (let i = 0; i < this._rays.length; i++) {
            const even = i % 2 === 0;
            const ray = this._rays[i];
            const rayAngle = angle + degToRad(offsetAngle * evenIndex * (even ? -1 : 1));
            const intersection = ray.cast(position, rayAngle, this._joystickButtons);
            if (intersection) intersections.push(intersection);
            if (even) evenIndex++;
        }

        return intersections;
    }

    _setTargetedJoystickButton(button) {
        if (!button) return;

        this._targetedJoystickButton = button;

        this._targetedJoystickButton.isTargeted = true;

        for (let i = 0; i < this._joystickButtons.length; i++) {
            const joystickButton = this._joystickButtons[i];
            if (joystickButton === this._targetedJoystickButton) continue;
            joystickButton.isTargeted = false;
        }
    }

    _setFocusedJoystickButton(button) {
        if (!button) return;

        this._focusedJoystickButton = button;

        this._focusedJoystickButton.isFocused = true;
        this._focusPosition.x = this._focusedJoystickButton.bounds.x + this._focusedJoystickButton.bounds.width / 2;
        this._focusPosition.y = this._focusedJoystickButton.bounds.y + this._focusedJoystickButton.bounds.height / 2;

        for (let i = 0; i < this._joystickButtons.length; i++) {
            const joystickButton = this._joystickButtons[i];
            if (joystickButton === this._focusedJoystickButton) continue;
            joystickButton.isFocused = false;
        }
    }

    _bindAll() {
        this._joystickGrabHandler = this._joystickGrabHandler.bind(this);
        this._joystickMoveHandler = this._joystickMoveHandler.bind(this);
        this._joystickReleaseHandler = this._joystickReleaseHandler.bind(this);
    }

    _setupEventListeners() {
        this._joystick.addEventListener('joystick:grab', this._joystickGrabHandler);
        this._joystick.addEventListener('joystick:move', this._joystickMoveHandler);
        this._joystick.addEventListener('joystick:release', this._joystickReleaseHandler);
    }

    _removeEventListeners() {
        this._joystick.removeEventListener('joystick:grab', this._joystickGrabHandler);
        this._joystick.removeEventListener('joystick:move', this._joystickMoveHandler);
        this._joystick.removeEventListener('joystick:release', this._joystickReleaseHandler);
    }

    _joystickGrabHandler(e) {

    }

    _joystickMoveHandler(e) {
        this._joystickAngle = e.angle;
        this._joystickPosition.x = e.relativePosition.x;
        this._joystickPosition.y = e.relativePosition.y;

        const targetedButton = this._getTargetedButton();
        this._setTargetedJoystickButton(targetedButton);
    }

    _joystickReleaseHandler() {
        this._getTargetedButton();

        const focusedButton = this._getTargetedButton();
        this._setFocusedJoystickButton(focusedButton);
    }
}
