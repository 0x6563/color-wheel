import type { RGBColor } from "./rgb";
import { BlendChannels, LinearAdditive } from "./shared";

export class CMYK {
    static FromRGB({ r, g, b }: RGBColor): CMYKColor {
        const r1 = 1 - (r / 255);
        const g1 = 1 - (g / 255);
        const b1 = 1 - (b / 255);
        const k = Math.min(r1, g1, b1);

        const c = (r1 - k) / (1 - k);
        const m = (g1 - k) / (1 - k);
        const y = (b1 - k) / (1 - k);
        return { c, m, y, k };
    }

    static Blend(a: CMYKColor, b: CMYKColor, scale: number): CMYKColor {
        return BlendChannels(a, b, scale, LinearAdditive);
    }
}

export interface CMYKColor {
    c: number;
    m: number;
    y: number;
    k: number;
}