<script lang="ts">
    import { Circle } from '@services/circle';
    import { RGB, RGBBlending, type RGBBlendModes, type RGBColor } from '@services/color';
    import { createEventDispatcher, onMount } from 'svelte';
    export let blend: RGBBlendModes;
    export let colors: string[] = [];
    export let rotation = 0;
    export let wheelstart = 0;
    export let inner = '';
    export let outer = '';
    export let tiers = 1;
    export let intervals = 360;
    export let skipinner = 0;
    export let skipouter = 0;
    export let stroke = '';
    export let tierblend = 'None';
    let circle: Circle;
    const dispatch = createEventDispatcher();
    $: {
        if (wheelstart || blend || colors || rotation || inner || outer || intervals || tiers || skipinner || skipouter || stroke || tierblend) {
            DrawColorWheel();
        }
    }
    let point: Coordinate & { radius: number; angle: number };
    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;
    let active = false;
    interface Coordinate {
        x: number;
        y: number;
    }

    onMount(() => {
        context = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        DrawColorWheel();

        canvas.addEventListener('mousedown', (e) => {
            active = true;
            point = GetPoint(e);
            Bubble('start');
        });

        canvas.addEventListener(
            'touchstart',
            (e) => {
                active = true;
                point = GetPoint(e.touches[0]);
                Bubble('start');
            },
            { passive: false }
        );

        window.addEventListener('mousemove', (e) => {
            if (!active) {
                return;
            }
            point = GetPoint(e);
            Bubble('move');
        });

        window.addEventListener(
            'touchmove',
            (e) => {
                if (!active) {
                    return;
                }
                point = GetPoint(e.touches[0]);
                e.preventDefault();
                Bubble('move');
            },
            { passive: false }
        );

        window.addEventListener('mouseup', (e) => {
            active = false;
            Bubble('end');
        });

        window.addEventListener(
            'touchend',
            (e) => {
                if (!active) {
                    return;
                }
                active = false;
                e.preventDefault();
                Bubble('end');
            },
            { passive: false }
        );

        window.addEventListener('resize', () => {
            DrawColorWheel();
        });
    });

    function Bubble(type: 'draw' | 'start' | 'move' | 'end') {
        dispatch(type, { circle, point, canvas, context });
    }

    function Cap(low: number, high: number, value: number) {
        return Math.min(high, Math.max(low, value));
    }

    function GetPoint(e) {
        const { width, height, left, top } = canvas.getBoundingClientRect();
        const scaleX = canvas.width / width;
        const scaleY = canvas.height / height;
        const ref = {
            x: (e.clientX - left) * scaleX,
            y: (e.clientY - top) * scaleY,
        };
        return circle.getPoint(ref, true);
    }

    function DrawColorWheel() {
        if (!context) {
            return;
        }
        if ((inner && !RGB.ParseHex(inner)) || (outer && !RGB.ParseHex(outer)) || !intervals || intervals < 0) {
            return;
        }
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        context.clearRect(0, 0, canvas.width, canvas.height);
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        circle = new Circle({ x, y }, Math.min(x, y));
        const looped = colors.slice().map((v) => RGB.ParseHex(v) as RGBColor);
        looped.push(looped[0]);
        const width = 360 / intervals;
        const strokeStyle = RGB.ParseHex(stroke) ? stroke : '';
        DrawSlice(0, 360, 0, circle.radius);

        context.fillStyle = '#FFF';
        context.fill();

        for (let step = 0; step <= intervals + 1; step++) {
            const arc = intervals >= step ? width + 1 : width;
            const angle = (360 / intervals) * step;
            const color = GetIntervalColor((angle - wheelstart + 360) % 360, 360, looped);
            const startAngle = rotation + angle;
            const endAngle = rotation + angle + arc;
            DrawSlice(startAngle, endAngle, 0, circle.radius);

            if (strokeStyle) {
                context.strokeStyle = strokeStyle;
                context.stroke();
            }
            const stops: { color: RGBColor; scale: number }[] = [];

            if (!tiers) {
                if (inner) {
                    stops.push({ scale: 0, color: RGB.ParseHex(inner) as RGBColor });
                }

                stops.push({ scale: 0.5, color });

                if (outer) {
                    stops.push({ scale: 1, color: RGB.ParseHex(outer) as RGBColor });
                }
            } else {
                const colors: RGBColor[] = [];
                let t = Math.max(1, tiers);
                if (inner) {
                    t++;
                    colors.push(RGB.ParseHex(inner) as RGBColor);
                }
                colors.push(color);
                if (outer) {
                    t++;
                    colors.push(RGB.ParseHex(outer) as RGBColor);
                }
                colors.push(colors[colors.length - 1]);
                const low = Cap(0, t, skipinner);
                const high = t - Cap(0, t, skipouter);
                for (let i = low; i < high; i++) {
                    stops.push({ color: GetIntervalColor(i, t, colors), scale: (i - low) / (high - low) });
                }
            }
            if (tierblend === 'Smooth') {
                const gradient = context.createRadialGradient(x, y, 0, x, y, circle.radius);
                for (const stop of stops) {
                    gradient.addColorStop(stop.scale, RGB.Format(stop.color));
                }
                context.fillStyle = gradient;
                context.fill();
            } else {
                for (let i = 0; i < stops.length; i++) {
                    const current = stops[i];
                    const next = stops[i + 1];
                    const inner = circle.radius * Cap(0, 1, current.scale);
                    const outer = circle.radius * Cap(0, 1, (next?.scale || 1) + 0.01);
                    DrawSlice(startAngle, endAngle, inner, outer);
                    context.fillStyle = RGB.Format(current.color);
                    context.fill();
                    if (strokeStyle) {
                        context.strokeStyle = strokeStyle;
                        context.stroke();
                    }
                }
            }
        }
        Bubble('draw');
    }
    function DrawSlice(start, end, inner, outer) {
        const a1 = Circle.DegreesToRadians(start);
        const b1 = Circle.DegreesToRadians(end);
        context.beginPath();
        if (inner) {
            context.arc(circle.center.x, circle.center.y, inner, b1, a1, true);
        } else {
            context.moveTo(circle.center.x, circle.center.y);
        }

        context.arc(circle.center.x, circle.center.y, outer, a1, b1, false);
        context.closePath();
    }
    function GetIntervalColor(interval: number, max: number, colors: RGBColor[]) {
        const size = max / (colors.length - 1);
        const i = Math.floor(interval / size);
        if (i == colors.length) {
            return colors[colors.length - 1];
        }
        const low = colors[i];
        const high = colors[i + 1];
        const scale = (interval % size) / size;
        return RGBBlending[blend](low, high, scale);
    }
</script>

<canvas class={active ? 'active' : ''} bind:this={canvas} height="200" width="200" />

<style>
    canvas {
        aspect-ratio: 1;
        max-height: 100%;
        height: 100%;
        width: 100%;
        clip-path: circle(50%);
        cursor: crosshair;
    }
    canvas.active {
        cursor: none;
    }
</style>
