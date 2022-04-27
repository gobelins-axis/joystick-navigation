// Vendor
import { gsap } from 'gsap';

// Utils
import EventDispatcher from './EventDispatcher';
import DragManager from './DragManager';
import math from './math';

export default class JoystickEmulator extends EventDispatcher {
    constructor(options) {
        super();

        this._el = options.el;
        this._radius = options.radius;

        this._dragstartPosition = { x: 0, y: 0 };

        this._dragPosition = { x: 0, y: 0 };

        this._stickPosition = { x: 0, y: 0 };

        this._relativeStickPosition = { x: 0, y: 0 };

        this._stickDistance = 0;

        this._stickAngle = 0;

        this._dragManager = this._createDragManager();

        this._bindAll();
        this._setupEventListeners();
    }

    /**
     * Private
     */
    _createDragManager() {
        const dragManager = new DragManager({
            el: this._el,
        });

        return dragManager;
    }

    _resetStick() {
        this._tweenReset = gsap.to(this._stickPosition, { duration: 0.5, x: 0, y: 0, ease: 'power3.out' });
    }

    _updateStickPosition() {
        this._el.style.transform = `translate(${this._stickPosition.x}px, ${this._stickPosition.y}px)`;
    }

    /**
     * Events
     */
    _bindAll() {
        this._dragstartHandler = this._dragstartHandler.bind(this);
        this._dragHandler = this._dragHandler.bind(this);
        this._dragendHandler = this._dragendHandler.bind(this);
        this._tickHandler = this._tickHandler.bind(this);
    }

    _setupEventListeners() {
        this._dragManager.addEventListener('dragstart', this._dragstartHandler);
        this._dragManager.addEventListener('drag', this._dragHandler);
        this._dragManager.addEventListener('dragend', this._dragendHandler);
        gsap.ticker.add(this._tickHandler);
    }

    _removeEventListeners() {
        this._dragManager.dispose();
        gsap.ticker.remove(this._tickHandler);
    }

    _dragstartHandler(e) {
        this._dragstartPosition.x = e.position.x;
        this._dragstartPosition.y = e.position.y;

        this.dispatchEvent('joystick:grab', {
            position: this._dragstartPosition,
        });
    }

    _dragHandler(e) {
        this._tweenReset?.kill();

        const radius = this._radius - 30;

        this._dragPosition.x = e.position.x;
        this._dragPosition.y = e.position.y;

        const x = this._dragPosition.x - this._dragstartPosition.x;
        const y = this._dragPosition.y - this._dragstartPosition.y;

        const distance = math.distance({ x: 0, y: 0 }, { x, y });
        const angle = math.angle(this._dragPosition, this._dragstartPosition);
        const clampedDistance = math.clamp(distance, -radius, radius);
        const stickDistance = clampedDistance / radius;
        const stickPosition = {};
        stickPosition.x = (Math.cos(angle) * clampedDistance);
        stickPosition.y = (Math.sin(angle) * clampedDistance);

        const relativeStickPosition = {};
        relativeStickPosition.x = stickPosition.x / radius;
        relativeStickPosition.y = stickPosition.y / radius;

        const distanceDelta = stickDistance - this._stickDistance;
        this._stickDistance = stickDistance;

        const positionDelta = {};
        positionDelta.x = stickPosition.x - this._stickPosition.x;
        positionDelta.y = stickPosition.y - this._stickPosition.y;
        this._stickPosition.x = stickPosition.x;
        this._stickPosition.y = stickPosition.y;

        const relativePositionDelta = {};
        relativePositionDelta.x = relativeStickPosition.x - this._relativeStickPosition.x;
        relativePositionDelta.y = relativeStickPosition.y - this._relativeStickPosition.y;
        this._relativeStickPosition.x = relativePositionDelta.x;
        this._relativeStickPosition.y = relativePositionDelta.y;

        const angleDelta = angle - this._stickAngle;
        this._stickAngle = angle;

        this.dispatchEvent('joystick:move', {
            distance: this._stickDistance,
            distanceDelta,
            position: this._stickPosition,
            positionDelta,
            relativePosition: this._relativeStickPosition,
            relativePositionDelta,
            angle: this._stickAngle,
            angleDelta,
        });
    }

    _dragendHandler(e) {
        this._resetStick();

        this.dispatchEvent('joystick:release', {});
    }

    _tickHandler() {
        this._updateStickPosition();
    }
}
