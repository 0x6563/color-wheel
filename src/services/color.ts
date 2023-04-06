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
        return Blend(a, b, scale, LinearAdditive);
    }

    static BlendQuadraticAdditive(a: RGBColor, b: RGBColor, scale: number) {
        return Blend(a, b, scale, QuadraticAdditive);
    }

    static BlendSubtractive(a: RGBColor, b: RGBColor, scale: number) {
        const c = RGB.Invert(a);
        const d = RGB.Invert(b);
        const f = {
            r: Math.max(0, 255 - c.r - d.r),
            g: Math.max(0, 255 - c.g - d.g),
            b: Math.max(0, 255 - c.b - d.b)
        }

        let cd = RGB.Distance(a, b);
        cd = 4.0 * scale * (1.0 - scale) * cd;
        return Blend(Blend(a, b, scale, LinearAdditive), f, cd, LinearAdditive);
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
}

export interface RGBColor {
    r: number;
    g: number;
    b: number;
}

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
        return Blend(a, b, scale, LinearAdditive);
    }
}

export interface CMYKColor {
    c: number;
    m: number;
    y: number;
    k: number;
}

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
        return Blend(a, b, scale, LinearAdditive)
    }
}
export interface LABColor {
    l: number;
    a: number;
    b: number;
}
function Blend<T>(a: T, b: T, scale: number, math: (a: number, b: number, scale: number) => number): T {
    const c: T = {} as T;
    for (const key in a) {
        c[key] = math(a[key] as number, b[key] as number, scale) as any;
    }
    return c;
}

function Hex(n: number) {
    return n.toString(16).padStart(2, '0');
}

function LinearAdditive(a: number, b: number, scale: number) {
    return Math.floor((1 - scale) * a + scale * b);

}

function QuadraticAdditive(a: number, b: number, scale: number) {
    return Math.floor(Math.sqrt((1 - scale) * (a * a) + scale * (b * b)));
}


export const RGBBlending = {
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
    },
    CMYK(a: RGBColor, b: RGBColor, scale: number) {
        const a1 = CMYK.FromRGB(a);
        const b1 = CMYK.FromRGB(b);
        const mixed = CMYK.Blend(a1, b1, scale);
        return RGB.FromCMYK(mixed);
    },
};
export type RGBBlendModes = keyof typeof RGBBlending; 
