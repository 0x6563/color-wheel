<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Circle } from '@services/circle';
    import Wheel from './canvas-wheel.svelte';
    import { RGB, type RGBColor } from '@services/colorspace/rgb';
    import type { ColorWheel, RGBBlender } from '@services/color';
    export let blender: RGBBlender;
    export let harmony: HarmonyTranslation[] = [{ rotate: 180 }];
    export let colors: string[] = ['#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80', '#00FFFF', '#0080FF', '#0000FF', '#8000FF', '#FF00FF', '#FF0080'];
    export let renderrotation = 0;
    export let wheelrotation = 0;
    export let inner = '#FF0000';
    export let outer = '#0000FF';
    export let slices = 360;
    export let tiers = 1;
    export let skipinner = 0;
    export let skipouter = 0;
    export let stroke = '';
    export let blend: 'Smooth' | 'None' = 'None';
    export let colorpicking: 'Calculated' | 'Rendered' = 'Calculated';
    const dispatch = createEventDispatcher();
    interface Coordinate {
        x: number;
        y: number;
    }
    let circle: Circle;
    let wheel: ColorWheel<RGBColor>;
    let context: CanvasRenderingContext2D;
    let angle = 0;
    let pct = 0;
    let startAngle = 0;
    let ready = {
        wheel1: false,
        wheel2: false,
        wheel3: false,
    };

    $: {
        if (harmony || angle || pct || colorpicking) {
            DrawPreviews();
        }
    }
    interface HarmonyTranslation {
        element?: HTMLElement;
        rotate?: number;
        rotateModulo?: number;
        scaleAbsolute?: number;
        scaleRelative?: number;
        children?: HarmonyTranslation[];
    }

    function DrawPreviews() {
        if (!context) {
            return;
        }
        const event: any = { translations: [] };
        for (const h of harmony) {
            const section: any = {
                color: DrawPreview(h, colorpicking),
                children: [],
            };
            if (h.children) {
                section.children = h.children.map((v) => DrawPreview(v, colorpicking));
            }
            event.translations.push(section);
        }
        dispatch('update', event);
    }

    function CalculateTranslation(angle: number, scale: number, translation: HarmonyTranslation) {
        let offset = 0;
        if (translation.scaleAbsolute) {
            offset = translation.scaleAbsolute;
        } else if (translation.scaleRelative && translation.scaleRelative > 0) {
            offset = (1 - scale) * translation.scaleRelative + scale;
        } else if (translation.scaleRelative && translation.scaleRelative < 0) {
            offset = scale * translation.scaleRelative;
        }
        return {
            angle: Circle.Rotate(translation.rotateModulo ? angle % translation.rotateModulo : angle, translation.rotate || 0),
            scale: Cap(0, 1, scale + offset),
        };
    }
    function Cap(low: number, high: number, value: number) {
        return Math.min(high, Math.max(low, value));
    }

    function DrawPreview(translation: HarmonyTranslation, mode: 'Rendered' | 'Calculated') {
        const scale = pct / 100;
        const calc = CalculateTranslation(angle, scale, translation);
        const coord = circle.getCoordinate(calc.angle, calc.scale);
        let rgb: RGBColor | undefined;
        if (mode == 'Calculated') {
            rgb = wheel.getColor(calc.angle - renderrotation, calc.scale);
        } else {
            rgb = GetContextColor(coord);
        }
        if (!rgb) {
            return;
        }
        const color = RGB.Format(rgb);
        if (translation.element) {
            const { width, height } = translation.element.getBoundingClientRect();
            translation.element.style.backgroundColor = color;
            translation.element.style.left = `${coord.x - width / 2}px`;
            translation.element.style.top = `${coord.y - height / 2}px`;
        }
        return color;
    }

    function GetContextColor({ x, y }: Coordinate) {
        if (!context || typeof x === 'undefined') {
            return;
        }
        const [r, g, b, a] = context.getImageData(x, y, 1, 1).data;
        if (a == 0) {
            return;
        }
        return { r, g, b };
    }

    function Wheel1Handler({ type, detail }) {
        ready.wheel1 = true;
        if (type == 'start') {
            startAngle = renderrotation - detail.point.angle;
        } else if (type == 'move') {
            renderrotation = (startAngle + detail.point.angle) % 360;
        }
    }

    function Wheel2Handler({ type, detail }) {
        ready.wheel2 = true;

        if (type == 'start') {
            startAngle = wheelrotation - detail.point.angle;
        } else if (type == 'move') {
            wheelrotation = (startAngle + detail.point.angle) % 360;
        }
    }

    function Wheel3Handler({ type, detail }) {
        context = detail.context;
        circle = detail.circle;
        wheel = detail.wheel;
        if (type != 'draw' || !ready.wheel3) {
            const ref = detail.point || circle.getRandomPoint();
            ready.wheel3 = true;
            pct = parseFloat((100 * (ref.radius / circle.radius)).toFixed(2));
            angle = parseFloat(ref.angle.toFixed(2));
        }
        ready.wheel3 = true;

        DrawPreviews();
    }
</script>

<div class="box" class:ready={ready.wheel1 && ready.wheel2 && ready.wheel3}>
    <div class="layer level1">
        <Wheel {colors} renderrotation={renderrotation + wheelrotation} {blender} slices={colors.length} {stroke} on:start={Wheel1Handler} on:move={Wheel1Handler} on:draw={Wheel1Handler} />
    </div>
    <div class="layer level2">
        <Wheel {colors} {renderrotation} {blender} {stroke} {wheelrotation} on:start={Wheel2Handler} on:move={Wheel2Handler} on:draw={Wheel2Handler} />
    </div>
    <div class="layer level3">
        <Wheel {colors} {renderrotation} {blender} {inner} {outer} {slices} {tiers} {blend} {skipinner} {skipouter} {stroke} {wheelrotation} on:start={Wheel3Handler} on:draw={Wheel3Handler} on:move={Wheel3Handler} />

        {#each harmony as a, i}
            <span class:primary={i == 0} class:secondary={i > 0} class="preview" bind:this={a.element} />
            {#if a.children}
                {#each a.children as b}
                    <span class="secondary preview" bind:this={b.element} />
                {/each}
            {/if}
        {/each}
    </div>
    <div class="angle">
        <input type="number" bind:value={angle} min="0" max="360" step="0.01" />
        <span class="symbol">°</span>
    </div>
    <div class="radius">
        <input type="number" bind:value={pct} min="0" max="100" step="0.01" />
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
            color: var(--stroke);
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
        box-shadow: 0px 0px 5px 1px #000;
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
    .primary {
        height: 32px;
        width: 32px;
    }
    .secondary {
        height: 16px;
        width: 16px;
    }
    @media (orientation: portrait) {
        .angle {
            top: -60px;
        }
        .radius {
            bottom: -60px;
        }
    }
</style>
