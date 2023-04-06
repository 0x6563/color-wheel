<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Circle } from '@services/circle';
    import { RGB, type RGBBlendModes } from '@services/color';
    import Wheel from './canvas-wheel.svelte';
    export let blend: RGBBlendModes;
    export let harmony: Harmony[] = [{ rotate: 180 }];
    export let colors: string[] = ['#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80', '#00FFFF', '#0080FF', '#0000FF', '#8000FF', '#FF00FF', '#FF0080'];
    export let rotation = 90;
    export let wheelstart = 90;
    export let inner = '#FF0000';
    export let outer = '#0000FF';
    export let intervals = 360;
    export let tiers = 1;
    export let skipinner = 0;
    export let skipouter = 0;
    export let stroke = '';
    export let tierblend = 'None';
    const dispatch = createEventDispatcher();
    interface Coordinate {
        x: number;
        y: number;
    }
    let circle: Circle;
    let context: CanvasRenderingContext2D;
    let angle = 0;
    let radiusPct = 0;
    let startAngle = 0;
    let ready = {
        wheel1: false,
        wheel2: false,
        wheel3: false,
    };

    $: {
        if (harmony || angle || radiusPct) {
            DrawPreviews();
        }
    }
    interface Harmony {
        element?: HTMLElement;
        rotate?: number;
        rotateModulo?: number;
        radiusOffset?: number;
        radiusStep?: number;
        children?: Harmony[];
    }

    function DrawPreviews() {
        if (!context) {
            return;
        }
        const event: any = {
            alternates: [],
        };
        const radiusAbs = (radiusPct / 100) * circle.radius;
        for (let index = 0; index < harmony.length; index++) {
            const alt = harmony[index];
            const coord = CalculateAlternate(circle, angle, radiusAbs, alt);
            const color = GetColor(context, coord) as string;
            const a: any = {
                color: color,
                children: [],
            };
            DrawPreview(alt.element as HTMLElement, coord, color);
            if (alt.children) {
                for (const alt2 of alt.children) {
                    const coord = CalculateAlternate(circle, angle, radiusAbs, alt2);
                    const color = GetColor(context, coord) as string;
                    a.children.push(color);
                    DrawPreview(alt2.element as HTMLElement, coord, color);
                }
            }
            event.alternates.push(a);
        }
        dispatch('update', event);
    }
    function CalculateAlternate(circle: Circle, angle: number, radius: number, alternate: Harmony) {
        let offset = 0;
        if (alternate.radiusOffset) {
            offset = circle.radius * alternate.radiusOffset;
        } else if (alternate.radiusStep && alternate.radiusStep > 0) {
            offset = (circle.radius - radius) * alternate.radiusStep;
        } else if (alternate.radiusStep && alternate.radiusStep < 0) {
            offset = radius * alternate.radiusStep;
        }
        const rotated = Rotate(alternate.rotateModulo ? angle % alternate.rotateModulo : angle, alternate.rotate || 0);
        return circle.getCoordinate(rotated, Cap(0, circle.radius, radius + offset));
    }

    function Cap(low: number, high: number, value: number) {
        return Math.min(high, Math.max(low, value));
    }
    function DrawPreview(element: HTMLElement, coord: Coordinate, color: string) {
        if (!element) {
            return;
        }
        const { width, height } = element.getBoundingClientRect();
        element.style.backgroundColor = color;
        element.style.left = `${coord.x - width / 2}px`;
        element.style.top = `${coord.y - height / 2}px`;
    }

    function Rotate(angle: number, degrees: number) {
        return (angle + degrees) % 360;
    }

    function GetColor(context, { x, y }: Coordinate) {
        if (!context || typeof x === 'undefined') {
            return;
        }
        const [r, g, b, a] = context.getImageData(x, y, 1, 1).data;
        if (a == 0) {
            return;
        }
        return RGB.Format({ r, g, b });
    }

    function Wheel1Handler({ type, detail }) {
        ready.wheel1 = true;
        if (type == 'start') {
            startAngle = rotation - detail.point.angle;
        } else if (type == 'move') {
            rotation = (startAngle + detail.point.angle) % 360;
        }
    }

    function Wheel2Handler({ type, detail }) {
        ready.wheel2 = true;

        if (type == 'start') {
            startAngle = wheelstart - detail.point.angle;
        } else if (type == 'move') {
            wheelstart = (startAngle + detail.point.angle) % 360;
        }
    }

    function Wheel3Handler({ type, detail }) {
        context = detail.context;
        circle = detail.circle;
        if (type != 'draw' || !ready.wheel3) {
            const ref = detail.point || circle.getRandomPoint();
            const color = GetColor(context, ref);
            if (!color) {
                return;
            }
            ready.wheel3 = true;
            radiusPct = parseFloat((100 * (ref.radius / circle.radius)).toFixed(2));
            angle = parseFloat(ref.angle.toFixed(2));
        }
        ready.wheel3 = true;

        DrawPreviews();
    }
</script>

<div class="box" class:ready={ready.wheel1 && ready.wheel2 && ready.wheel3}>
    <div class="layer level1">
        <Wheel {colors} rotation={rotation + wheelstart} {blend} intervals={colors.length} {stroke} on:start={Wheel1Handler} on:move={Wheel1Handler} on:draw={Wheel1Handler} />
    </div>
    <div class="layer level2">
        <Wheel {colors} {rotation} {blend} {stroke} {wheelstart} on:start={Wheel2Handler} on:move={Wheel2Handler} on:draw={Wheel2Handler} />
    </div>
    <div class="layer level3">
        <Wheel {colors} {rotation} {blend} {inner} {outer} {intervals} {tiers} {tierblend} {skipinner} {skipouter} {stroke} {wheelstart} on:start={Wheel3Handler} on:draw={Wheel3Handler} on:move={Wheel3Handler} />

        {#each harmony as a, i}
            <span class:main={i == 0} class:alternate={i > 0} class="preview" bind:this={a.element} />
            {#if a.children}
                {#each a.children as b}
                    <span class="alternate preview" bind:this={b.element} />
                {/each}
            {/if}
        {/each}
    </div>
    <div class="angle">
        <input type="number" bind:value={angle} min="0" max="360" step="0.01" />
        <span class="symbol">°</span>
    </div>
    <div class="radius">
        <input type="number" bind:value={radiusPct} min="0" max="100" step="0.01" />
        <div class="symbol">%</div>
    </div>
</div>

<style lang="scss">
    .box {
        opacity: 0;
        aspect-ratio: 1;
        max-height: 100%;
        position: relative;
        box-sizing: border-box;
        margin: auto;
        position: relative;
        transition: all 350ms;
    }
    .box.ready {
        opacity: 1;
    }
    .radius,
    .angle {
        position: absolute;
        right: 0;
        display: flex;
        font-size: 2em;
        line-height: 1em;
        input {
            background: none;
            border: none;
            color: #fff;
            font-size: 1em;
            line-height: 1em;
            text-align: right;
            &:focus {
                outline: none;
            }

            -moz-appearance: textfield;
            &::-webkit-outer-spin-button,
            &::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
        }
    }
    .angle {
        top: 0;
    }
    .radius {
        bottom: 0;
    }
    .layer {
        position: absolute;
        border: solid 2px #fff;
        border-radius: 50%;
        box-sizing: border-box;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        aspect-ratio: 1;
        margin: auto;
    }
    .level1 {
        height: 100%;
        box-shadow: 1px 1px 4px #000;
    }
    .level2 {
        height: 90%;
    }
    .level3 {
        height: 80%;
    }

    .preview {
        cursor: none;
        display: inline-block;
        border-radius: 50%;
        border: solid 2px #fff;
        box-shadow: 1px 1px 2px #000;
        position: absolute;
        transition: all 75ms;
        z-index: 1;
        pointer-events: none;
    }
    .main {
        height: 32px;
        width: 32px;
    }
    .alternate {
        height: 16px;
        width: 16px;
    }
</style>
