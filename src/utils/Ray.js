// Utils
import math from '../utils/math';

export default class Ray {
    constructor(options = {}) {
        this._position = options.position || { x: 0, y: 0 };
        this._angle = options.angle || 0; // Radians
        this._direction = options.direction || { x: 0, y: 0 };
        this._priority = options.priority;

        this._debugLine = this._createDebugLine();
        this._updateDebugLine();
    }

    /**
     * Public
     */
    cast(position, angle, rects) {
        this._position.x = position.x;
        this._position.y = position.y;

        this._angle = angle;

        this._direction.x = Math.cos(angle);
        this._direction.y = Math.sin(angle);

        let closestIntersection = null;
        let closestIntersectionDistance = Infinity;

        for (let i = 0; i < rects.length; i++) {
            const intersection = this._castSingleRect(position, this._direction, rects[i]);

            if (!intersection) continue;

            const intersectionDistance = math.distance(this._position, intersection);

            if (intersectionDistance < closestIntersectionDistance) {
                closestIntersection = {
                    point: intersection,
                    target: rects[i],
                    distance: intersectionDistance,
                    priority: this._priority,
                };

                closestIntersectionDistance = intersectionDistance;
            }
        }

        this._updateDebugLine();

        return closestIntersection;
    }

    /**
     * Private
     */
    _castSingleRect(position, direction, rect) {
        // Use a line in the middle of the rect to make things simpler
        // Math original formula https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
        const x1 = rect.bounds.left;
        const y1 = rect.bounds.top + rect.bounds.height / 2;
        const x2 = rect.bounds.right;
        const y2 = rect.bounds.top + rect.bounds.height / 2;

        const x3 = position.x;
        const y3 = position.y;
        const x4 = position.x + direction.x;
        const y4 = position.y + direction.y;

        const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

        if (den === 0) return;

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

        if (t > 0 && t < 1 && u > 0) {
            const intersection = {};
            intersection.x = x1 + t * (x2 - x1);
            intersection.y = y1 + t * (y2 - y1);
            return intersection;
        }
    }

    _createDebugLine() {
        const line = document.createElement('div');
        line.style.position = 'absolute';
        line.style.left = 0;
        line.style.top = 0;
        line.style.width = `${window.innerWidth * window.innerHeight}px`;
        line.style.height = 0;
        line.style.borderBottom = `solid 1px rgba(255, 0, 0, ${this._priority})`;
        line.style.transformOrigin = 'left bottom';
        line.style.opacity = `${0.2 * this._priority}`;
        document.body.appendChild(line);
        return line;
    }

    _updateDebugLine() {
        const translate = `translate(${this._position.x}px, ${this._position.y}px)`;
        const rotate = `rotate(${this._angle}rad)`;
        this._debugLine.style.transform = `${translate} ${rotate}`;
    }
}
