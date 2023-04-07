<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { Circle } from '@services/circle';
    import { ColorWheel, type ColorBlender } from '@services/color';
    import { RGB, type RGBColor } from '@services/colorspace/rgb';
    export let blender: ColorBlender<RGBColor>;
    export let colors: string[] = [];
    export let renderrotation = 0;
    export let wheelrotation = 0;
    export let inner = '';
    export let outer = '';
    export let tiers = 1;
    export let slices = 360;
    export let skipinner = 0;
    export let skipouter = 0;
    export let stroke = '';
    export let blend: 'Smooth' | 'None' = 'None';
    let circle: Circle;
    const dispatch = createEventDispatcher();
    let v;
    $: v = { wheelrotation, blender, colors, renderrotation, inner, outer, slices, tiers, skipinner, skipouter, stroke, blend } && DrawColorWheel();

    let point: Coordinate & { radius: number; angle: number };
    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;
    let wheel: ColorWheel<RGBColor>;
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
        dispatch(type, { circle, point, canvas, context, wheel });
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
        if ((inner && !RGB.ParseHex(inner)) || (outer && !RGB.ParseHex(outer)) || !slices || slices < 0) {
            return;
        }

        wheel = new ColorWheel({
            colors: colors.map((v) => RGB.ParseHex(v) as RGBColor),
            blender,
            inner: RGB.ParseHex(inner),
            outer: RGB.ParseHex(outer),
            slices: slices,
            tiers,
            skipInner: skipinner,
            skipOuter: skipouter,
            wheelRotation: wheelrotation,
            renderRotation: renderrotation,
            blend: blend,
        });
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        context.clearRect(0, 0, canvas.width, canvas.height);
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        circle = new Circle({ x, y }, Math.min(x, y));
        const segments = blend == 'None' ? slices : 360;
        const width = 360 / segments;
        const strokeStyle = RGB.ParseHex(stroke) ? stroke : '';
        DrawSlice(0, 360, 0, circle.radius);

        context.fillStyle = '#FFF';
        context.fill();
        const canvasOffset = 270;
        for (let slice = 0; slice <= segments + 1; slice++) {
            const arc = segments >= slice ? width + 1 : width;
            const angle = width * slice;
            const startAngle = canvasOffset + renderrotation + angle;
            const endAngle = canvasOffset + renderrotation + angle + arc;
            DrawSlice(startAngle, endAngle, 0, circle.radius);
            const stops = wheel.getStops(angle);
            if (strokeStyle) {
                context.strokeStyle = strokeStyle;
                context.stroke();
            }
            if (blend === 'Smooth' && stops.length > 1) {
                const gradient = context.createRadialGradient(x, y, 0, x, y, circle.radius);
                const step = 1 / (stops.length - 1);
                let scale = 0;
                for (const stop of stops) {
                    gradient.addColorStop(scale, RGB.Format(stop));
                    scale += step;
                }
                context.fillStyle = gradient;
                context.fill();
            } else {
                const step = 1 / stops.length;

                for (let i = 0; i < stops.length; i++) {
                    const current = stops[i];
                    const inner = circle.radius * Cap(0, 1, i * step);
                    const outer = circle.radius * Cap(0, 1, (i + 1) * step + 0.01);
                    DrawSlice(startAngle, endAngle, inner, outer);
                    context.fillStyle = RGB.Format(current);
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
