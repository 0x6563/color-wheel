export function BlendChannels<T>(a: T, b: T, scale: number, math: (a: number, b: number, scale: number) => number): T {
    const c: T = {} as T;
    for (const key in a) {
        c[key] = math(a[key] as number, b[key] as number, scale) as any;
    }
    return c;
}


export function LinearAdditive(a: number, b: number, scale: number) {
    return Math.floor((1 - scale) * a + scale * b);

}

export function QuadraticAdditive(a: number, b: number, scale: number) {
    return Math.floor(Math.sqrt((1 - scale) * (a * a) + scale * (b * b)));
}

