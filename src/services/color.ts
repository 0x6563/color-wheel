import { Circle } from "./circle";
import { LAB } from "./colorspace/lab";
import { RGB, type RGBColor } from "./colorspace/rgb";

export class ColorWheel<T> {
    static Defaults: Partial<ColorWheelOptions<any>> = {
        slices: 360,
        tiers: 32,
        skipInner: 0,
        skipOuter: 0,
        wheelRotation: 0,
        renderRotation: 0
    }
    private options: ColorWheelOptions<T>;
    private radialColors: T[];
    private linearColors: T[] = [];
    private linearId: number;
    constructor(options: ColorWheelOptions<T>) {
        this.options = Object.assign({}, ColorWheel.Defaults, options);
        this.radialColors = options.colors.slice();
        this.radialColors.push(this.radialColors[0]);
        const placeholder = {} as T;
        this.linearColors = [this.options.inner, placeholder, this.options.outer].filter(v => v) as T[];
        this.linearId = this.linearColors.indexOf(placeholder);
    }

    getColor(angle: number, scale?: number): T {
        if (typeof scale === 'undefined') {
            return this.getRadialColor(angle);
        }
        if (this.options.blend == 'None') {
            const stops = this.getStops(angle);
            return stops[Math.floor(Cap(0, stops.length - 1, scale * stops.length))]
        }
        return GetIntervalColor(scale, 1, this.getLinear(angle), this.options.blender);
    }


    getLinear(angle: number): T[] {
        const color = this.getColor(angle);
        const colors = this.linearColors.slice();
        colors[this.linearId] = color;
        return colors;
    }

    getStops(angle: number) {
        const linear = this.getLinear(angle);
        let stops: T[] = [];
        const { tiers } = this.options;
        if (!tiers) {
            return linear;
        } else {
            const t = Math.max(1, tiers) + linear.length - 1;
            const low = Cap(0, t, this.options.skipInner || 0);
            const high = t - Cap(0, t, this.options.skipOuter || 0);
            linear.push(linear[linear.length - 1]);
            for (let i = low; i < high; i++) {
                stops.push(GetIntervalColor(i, t, linear, this.options.blender));
            }
        }
        return stops;
    }

    private getRadialColor(angle: number) {
        let rotated = Circle.Rotate(angle - (this.options.wheelRotation || 0));
        if (this.options.blend == 'None' && rotated != 0) {
            rotated = Math.floor(rotated / 360 * (this.options.slices as number)) * (360 / (this.options.slices as number));
        }
        return GetIntervalColor(rotated, 360, this.radialColors, this.options.blender);
    }
}

function Cap(low: number, high: number, value: number) {
    return Math.min(high, Math.max(low, value));
}

interface ColorWheelOptions<T> {
    colors: T[];
    slices?: number;
    inner?: T;
    outer?: T;
    tiers?: number;
    wheelRotation?: number;
    renderRotation: number;
    skipInner?: number;
    skipOuter?: number;
    blend: 'Smooth' | 'None';
    blender: ColorBlender<T>
}
export function GetIntervalColor<T>(interval: number, max: number, colors: T[], blend: ColorBlender<T>) {
    const size = max / (colors.length - 1);
    const i = Math.floor(interval / size);
    if (i >= colors.length - 1) {
        return colors[colors.length - 1];
    }
    const low = colors[i];
    const high = colors[i + 1];
    const scale = (interval % size) / size;
    return blend(low, high, scale);
}

export const RGBBlending: { [key: string]: RGBBlender } = {
    'RGB Linear Additive': (a: RGBColor, b: RGBColor, scale: number) => {
        return RGB.BlendLinearAdditive(a, b, scale);
    },
    'RGB Quadratic Additive': (a: RGBColor, b: RGBColor, scale: number) => {
        return RGB.BlendLinearAdditive(a, b, scale);
    },
    'RGB Subtractive': (a: RGBColor, b: RGBColor, scale: number) => {
        return RGB.BlendSubtractive(a, b, scale);
    },
    LAB(a: RGBColor, b: RGBColor, scale: number) {
        const a1 = LAB.FromRGB(a);
        const b1 = LAB.FromRGB(b);
        const mixed = LAB.Blend(a1, b1, scale);
        return RGB.FromLAB(mixed);
    }
};
export type RGBBlendMode = keyof typeof RGBBlending;
export type ColorBlender<T> = (color1: T, color2: T, scale: number) => T;
export type RGBBlender = ColorBlender<RGBColor>;
