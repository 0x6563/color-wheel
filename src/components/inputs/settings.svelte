<script lang="ts">
    import { RGBBlending, type RGBBlender } from '@services/color';
    import Dropdown from '@components/inputs/dropdown.svelte';
    import Number from '@components/inputs/number.svelte';
    import ColorPicker from '@components/inputs/color-picker.svelte';
    import ColorBar from '@components/color-bar.svelte';
    import HarmonyList from '@components/inputs/harmony-list.svelte';
    import Flyout from '@components/flyout.svelte';
    import { RGB } from '@services/colorspace/rgb';
    import Icon from '@components/icon.svelte';
    const blends: string[] = ['None', 'Smooth'];
    const picks: string[] = ['Calculated', 'Rendered'];
    const ColorSetsFull: any = {
        'RYB 12': ['#fe2712', '#fc600a', '#fb9902', '#fccc1a', '#fefe33', '#b2d732', '#66b032', '#347c98', '#0247fe', '#4424d6', '#8601af', '#c21460'],
        'RYB 3': ['#fe2712', '#fefe33', '#0247fe'],
        'RGB 12': ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080'],
        'RGB 3': ['#ff0000', '#00ff00', '#0000ff'],
        Custom: ['#ff0000'],
    };
    const ColorSets = {
        ...ColorSetsFull,
    };
    ColorSetsFull.Custom = Array.from({ length: 6 }).map((v) => RGB.RandomColor());
    delete ColorSets['Custom'];
    const HarmoniesFull = {
        Custom: [{}, { angle: '(angle % 60) + 60' }, { angle: '(angle % 60) + 90' }, { angle: '(angle % 60) + 120' }],
        Shades: [{}, { scale: '.01' }, { scale: 'scale * .25' }, { scale: 'scale * .5' }, { scale: 'scale * .75' }],
        Complementary: [
            {
                children: [{ scale: 'scale - 0.1' }, { scale: 'scale + 0.1' }],
            },
            {
                angle: 'angle + 180',
                children: [
                    {
                        angle: 'angle + 180',
                        scale: 'scale - 0.1',
                    },
                    {
                        angle: 'angle + 180',
                        scale: 'scale + 0.1',
                    },
                ],
            },
        ],

        'Split Complementary': [{}, { angle: 'angle + 150' }, { angle: 'angle + 210' }],
        Triadic: [{}, { angle: 'angle + 120' }, { angle: 'angle + 240' }],
        Tetradic: [{}, { angle: 'angle + 90' }, { angle: 'angle + 180' }, { angle: 'angle + 270' }],
        Analagous: [{}, { angle: 'angle + 30' }, { angle: 'angle + 60' }, { angle: 'angle + 90' }],
    };

    const Harmonies: any = {
        ...HarmoniesFull,
    };
    delete Harmonies['Custom'];
    let editHarmony = false;
    let editCustomColors = false;

    export let colorpicking: 'Calculated' | 'Rendered' = 'Calculated';
    export let harmony: any = HarmoniesFull['Complementary'];
    export let tiers: number = 1;
    export let skipinner: number = 0;
    export let skipouter: number = 0;
    export let slices: number = 12;
    export let blender: RGBBlender = RGBBlending['RGB Linear Additive'];
    export let colors = ColorSets['RYB 12'];
    export let inner: string = '#ffffff';
    export let blend: 'Smooth' | 'None' = 'Smooth';
    export let outer: string = '#000000';
    export let stroke: string = '';

    function AppendColor() {
        ColorSetsFull.Custom.push('#FFFFFF');
        RefreshColors();
    }
    function RefreshColors() {
        ColorSetsFull.Custom = ColorSetsFull.Custom.filter((v) => v);
        colors = ColorSetsFull.Custom;
    }
    function RefreshHarmony() {
        harmony = HarmoniesFull.Custom;
    }
    function CopyColors({ detail }) {
        ColorSetsFull.Custom = detail.slice();
        RefreshColors();
    }
    function CopyHarmony({ detail }) {
        HarmoniesFull.Custom = JSON.parse(JSON.stringify(detail));
        harmony = HarmoniesFull.Custom;
    }
</script>

<div class="settings">
    <h3>Matching</h3>
    <Dropdown bind:value={colorpicking} options={picks}>
        <div slot="label" let:label class="flx row spread">
            <span class="grow label">Color Picking</span>
            <span class="variable">{label}</span>
        </div>
        <div slot="option" class="option" let:label let:selected class:selected>
            {label}
            {#if label == 'Rendered'}
                <div class="subtext">Use pixel data from the rendered color wheel.</div>
            {/if}
            {#if label == 'Calculated'}
                <div class="subtext">Use angle and percentage of radius to calculate color.</div>
            {/if}
        </div>
    </Dropdown>
    <Dropdown bind:value={harmony} options={HarmoniesFull}>
        <div slot="label" let:label class="flx row spread">
            <span class="grow label">Harmony</span>
            <span class="variable">{label}</span>
        </div>
        <div slot="option" class="option" let:label let:selected class:selected>
            {label}
        </div>
    </Dropdown>
    {#if harmony == HarmoniesFull.Custom}
        <button on:click={() => (editHarmony = !editHarmony)} class="wide subtext">{editHarmony ? 'Hide' : 'Show'} Harmony Config</button>
        <Flyout expanded={editHarmony} polling={100}>
            <h4>Custom Harmony</h4>
            <div class="subtext">
                There are two variables used:
                <ul>
                    <li>
                        <b>angle</b> (0-360) the angle in degrees.
                    </li>
                    <li>
                        <b>scale</b> (0-1) a percentage of the radius.
                    </li>
                </ul>
                Each formula is provided both variables referencing the current reference point. If a number outside (0 - 360) is returned to<b>Angle</b> it will be rotated accordingly. If a number outside of (0 - 1) is returned to <b>Scale</b> it will be capped to fit within those restraints. For examples, copy from one of the existing harmonies.
            </div>
            <Dropdown options={Harmonies} on:select={CopyHarmony}>
                <div slot="label" class="flx row spread subtext">Copy From</div>
                <div slot="option" class="option" let:label let:selected class:selected>
                    {label}
                </div>
            </Dropdown>
            <HarmonyList bind:harmony={HarmoniesFull.Custom} root={true} on:change={RefreshHarmony} />
        </Flyout>
    {/if}
</div>
<div>
    <h3>Pallete</h3>
    <Dropdown bind:value={colors} options={ColorSetsFull}>
        <div slot="label" let:label let:value class="flx row spread">
            <span class="grow label">Colors <span class="variable">({label})</span> </span>
            <ColorBar colors={value} />
        </div>

        <div class="flx row spread option" slot="option" let:label let:value let:selected class:selected>
            <span class="label">{label}</span>
            <ColorBar colors={value} />
        </div>
    </Dropdown>
    {#if colors == ColorSetsFull.Custom}
        <button on:click={() => (editCustomColors = !editCustomColors)} class="wide subtext">{editCustomColors ? 'Hide' : 'Show'} Color Config</button>
        <Flyout expanded={editCustomColors} polling={100}>
            <Dropdown options={ColorSets} on:select={CopyColors}>
                <div slot="label" class="flx row spread subtext">Copy From</div>
                <div class="flx row spread option" slot="option" let:label let:value let:selected class:selected>
                    <span class="grow label">{label}</span>
                    <ColorBar colors={value} />
                </div>
            </Dropdown>
            {#each ColorSetsFull.Custom as c, i}
                <ColorPicker bind:value={c} required={i == 0} on:blur={RefreshColors} on:reset={RefreshColors} />
            {/each}

            <button class="wide append" on:click={AppendColor}><Icon icon="variables" /></button>
        </Flyout>
    {/if}
    <div class="flx row spread">
        <span class="grow label">Inner</span>
        <ColorPicker bind:value={inner} />
    </div>
    <div class="flx row spread">
        <span class="grow label">Outer</span>
        <ColorPicker bind:value={outer} />
    </div>
    <div class="flx row spread">
        <span class="grow label">Stroke</span>
        <ColorPicker bind:value={stroke} />
    </div>
    <Dropdown bind:value={blender} options={RGBBlending}>
        <div slot="label" let:label class="flx row spread">
            <span class="grow label">Blending Algorithm</span>
            <span class="variable">{label}</span>
        </div>

        <div slot="option" class="option" let:label let:selected class:selected>
            {label}
        </div>
    </Dropdown>
</div>

<div>
    <h3>Resolution</h3>
    <Dropdown bind:value={blend} options={blends}>
        <div slot="label" let:value class="flx row spread">
            <span class="grow label">Blend <span class="variable">({value})</span></span>
            <ColorBar {colors} blend={value} />
        </div>
        <div slot="option" class="flx row spread option" let:value let:selected class:selected>
            <span class="label">{value}</span>
            <ColorBar {colors} blend={value} />
        </div>
    </Dropdown>

    {#if blend == 'None'}
        <div class="flx row spread">
            <span class="grow label">Slices</span>
            <Number bind:value={slices} />
        </div>
    {/if}
    <div class="flx row spread">
        <span class="grow label">Tiers</span>
        <Number bind:value={tiers} />
    </div>
    <div class="subtext">Excluding Inner and Outer colors.</div>

    <div class="flx row spread">
        <span class="grow label">Skip Inner Tiers</span>
        <Number bind:value={skipinner} />
    </div>
    <div class="flx row spread">
        <span class="grow label">Skip Outer Tiers</span>
        <Number bind:value={skipouter} />
    </div>
</div>

<style lang="scss">
    h3 {
        padding: 0;
        margin: 32px 0 4px;
    }
    h4 {
        padding: 0;
        margin: 0;
        margin-top: 24px;
        border-bottom: solid 1px #aaa;
    }

    button.wide {
        background: none;
        border: none;
        appearance: none;
        width: 100%;
        height: 2em;
        color: var(--stroke);
        cursor: pointer;
        &:focus {
            outline: none;
        }
    }
    .append {
        height: 2em;
        font-size: 2em;
        margin: 4px;
    }
    .option {
        padding: 8px;
        transition: all 200ms;
        background: var(--fill);

        &::before {
            content: ' ';
            display: inline-block;
            width: 15px;
        }
        &:hover {
            background: var(--light-fill);
        }
        &.selected {
            &::before {
                content: '▸';
            }
        }
    }

    .row {
        min-height: 32px;
        margin: 4px 0;
    }

    .spread {
        gap: 12px;
        .label {
            width: 30%;
            font-size: 1em;
        }
    }
</style>
