import type { CMYKColor } from "./cmyk";
import type { LABColor } from "./lab";
import { BlendChannels, LinearAdditive, QuadraticAdditive } from "./shared";

export class RGB {
    static ParseHex(input: string): RGBColor | undefined {
        const m = (input.match(/^#([0-9a-f]{6})$/i) as RegExpMatchArray)?.[1];
        if (m)
            return {
                r: parseInt(m.substring(0, 2), 16),
                g: parseInt(m.substring(2, 4), 16),
                b: parseInt(m.substring(4, 6), 16),
            };
    }

    static FromCMYK({ c, m, y, k }: CMYKColor): RGBColor {
        return {
            r: 255 * (1 - c) * (1 - k),
            g: 255 * (1 - m) * (1 - k),
            b: 255 * (1 - y) * (1 - k),
        };
    }

    static FromLAB({ l, a, b }: LABColor): RGBColor {
        let y = (l + 16) / 116;
        let x = a / 500 + y;
        let z = y - b / 200;
        let r1;
        let g1;
        let b1;

        x = 0.95047 * ((x * x * x > 0.008856) ? x * x * x : (x - 16 / 116) / 7.787);
        y = 1.00000 * ((y * y * y > 0.008856) ? y * y * y : (y - 16 / 116) / 7.787);
        z = 1.08883 * ((z * z * z > 0.008856) ? z * z * z : (z - 16 / 116) / 7.787);

        r1 = x * 3.2406 + y * -1.5372 + z * -0.4986;
        g1 = x * -0.9689 + y * 1.8758 + z * 0.0415;
        b1 = x * 0.0557 + y * -0.2040 + z * 1.0570;

        r1 = (r1 > 0.0031308) ? (1.055 * Math.pow(r1, 1 / 2.4) - 0.055) : 12.92 * r1;
        g1 = (g1 > 0.0031308) ? (1.055 * Math.pow(g1, 1 / 2.4) - 0.055) : 12.92 * g1;
        b1 = (b1 > 0.0031308) ? (1.055 * Math.pow(b1, 1 / 2.4) - 0.055) : 12.92 * b1;

        return {
            r: Math.floor(Math.max(0, Math.min(1, r1)) * 255),
            g: Math.floor(Math.max(0, Math.min(1, g1)) * 255),
            b: Math.floor(Math.max(0, Math.min(1, b1)) * 255)
        }
    }

    static BlendLinearAdditive(a: RGBColor, b: RGBColor, scale: number) {
        return BlendChannels(a, b, scale, LinearAdditive);
    }

    static BlendQuadraticAdditive(a: RGBColor, b: RGBColor, scale: number) {
        return BlendChannels(a, b, scale, QuadraticAdditive);
    }

    static BlendSubtractive(a: RGBColor, b: RGBColor, scale: number) {
        const c = RGB.Invert(a);
        const d = RGB.Invert(b);
        const f = {
            r: Math.max(0, 255 - c.r - d.r),
            g: Math.max(0, 255 - c.g - d.g),
            b: Math.max(0, 255 - c.b - d.b)
        }

        let distance = RGB.Distance(a, b);
        distance = 4.0 * scale * (1.0 - scale) * distance;
        return BlendChannels(BlendChannels(a, b, scale, LinearAdditive), f, distance, LinearAdditive);
    }

    static Format({ r, g, b }: RGBColor) {
        return `#${Hex(r)}${Hex(g)}${Hex(b)}`;
    }

    static Invert({ r, g, b }: RGBColor) {
        return { r: 255 - r, g: 255 - g, b: 255 - b };
    }

    static Distance(a: RGBColor, b: RGBColor) {
        const out = ((a.r - b.r) * (a.r - b.r) + (a.g - b.g) * (a.g - b.g) + (a.b - b.b) * (a.b - b.b));
        return Math.sqrt(out) / (Math.sqrt(3.0) * 255); //scale to 0-1
    }
    static RandomColor() {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        return RGB.Format({ r, g, b });
    }
}

export interface RGBColor {
    r: number;
    g: number;
    b: number;
}


function Hex(n: number) {
    return n.toString(16).padStart(2, '0');
}