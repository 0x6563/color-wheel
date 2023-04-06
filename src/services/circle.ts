
export class Circle {
    constructor(public center: Coordinate, public radius: number) { }

    getAngle(coord: Coordinate) {
        const x = coord.x - this.center.x;
        const y = coord.y - this.center.y;
        let offset;
        let relative;
        if (x >= 0 && y < 0) {
            offset = 0.5;
            relative = Math.atan(Math.abs(y) / Math.abs(x));
        } else if (x >= 0 && y >= 0) {
            offset = 1;
            relative = Math.atan(Math.abs(x) / Math.abs(y));
        } else if (x < 0 && y >= 0) {
            offset = 1.5;
            relative = Math.atan(Math.abs(y) / Math.abs(x));
        } else {
            offset = 2;
            relative = Math.atan(Math.abs(x) / Math.abs(y));
        }
        return (offset * Math.PI - relative) * (180 / Math.PI);
    }

    getCoordinate(angle: number, radius: number) {
        const radians = Circle.DegreesToRadians(angle);
        const x1 = radius * Math.cos(radians - 0.5 * Math.PI) || 0;
        const y2 = -1 * radius * Math.sin(radians - 0.5 * Math.PI) || 0;
        return { x: this.center.x + x1, y: this.center.y - y2 };
    }

    getPoint(target: Coordinate, limit?: boolean): Point {
        const radius = Math.hypot(Math.abs(this.center.x - target.x), Math.abs(this.center.y - target.y));
        const angle = this.getAngle(target);

        if (limit && this.radius < radius) {
            return { ...this.getCoordinate(angle, this.radius), radius: this.radius, angle };
        } else {
            return { ...target, radius, angle };
        }
    }

    getRandomPoint() {
        const x = Math.random() * this.radius * 2;
        const y = Math.random() * this.radius * 2;
        return this.getPoint({ x, y }, true);
    }

    static DegreesToRadians(degree: number) {
        return (degree * Math.PI) / 180;
    }

}
interface Point {
    x: number;
    y: number;
    angle: number;
    radius: number;
}

interface Coordinate {
    x: number;
    y: number;
}