import type { RGBColor } from "./rgb";
import { BlendChannels, LinearAdditive } from "./shared";


export class LAB {
    static FromRGB({ r, g, b }: RGBColor) {

        let x;
        let y;
        let z;

        let r1 = r / 255;
        let g1 = g / 255;
        let b1 = b / 255;

        r1 = (r1 > 0.04045) ? Math.pow((r1 + 0.055) / 1.055, 2.4) : r1 / 12.92;
        g1 = (g1 > 0.04045) ? Math.pow((g1 + 0.055) / 1.055, 2.4) : g1 / 12.92;
        b1 = (b1 > 0.04045) ? Math.pow((b1 + 0.055) / 1.055, 2.4) : b1 / 12.92;

        x = (r1 * 0.4124 + g1 * 0.3576 + b1 * 0.1805) / 0.95047;
        y = (r1 * 0.2126 + g1 * 0.7152 + b1 * 0.0722) / 1.00000;
        z = (r1 * 0.0193 + g1 * 0.1192 + b1 * 0.9505) / 1.08883;

        x = (x > 0.008856) ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116;
        y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116;
        z = (z > 0.008856) ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116;

        return {
            l: (116 * y) - 16,
            a: 500 * (x - y),
            b: 200 * (y - z)
        }
    }

    static Blend(a: LABColor, b: LABColor, scale: number): LABColor {
        return BlendChannels(a, b, scale, LinearAdditive)
    }
}
export interface LABColor {
    l: number;
    a: number;
    b: number;
}