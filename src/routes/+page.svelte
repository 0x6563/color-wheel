<script lang="ts">
    import ColorWheel from '@components/color-wheel.svelte';
    import { RGBBlending, type RGBBlendModes } from '@services/color';
    import Dropdown from '@components/inputs/dropdown.svelte';
    import Number from '@components/inputs/number.svelte';
    import ColorPicker from '@components/inputs/color-picker.svelte';
    import ColorBar from '@components/color-bar.svelte';
    import HarmonyList from '@components/inputs/harmony-list.svelte';
    import Flyout from '@components/flyout.svelte';
    const blendModes: RGBBlendModes[] = Object.keys(RGBBlending) as any;
    const tierblends: string[] = ['None', 'Smooth'];
    const ColorSetsFull: any = {
        'RYB 12': ['#FE2712', '#FC600A', '#FB9902', '#FCCC1A', '#FEFE33', '#B2D732', '#66B032', '#347C98', '#0247FE', '#4424D6', '#8601AF', '#C21460'],
        'RYB 3': ['#FE2712', '#FEFE33', '#0247FE'],
        'RGB 12': ['#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80', '#00FFFF', '#0080FF', '#0000FF', '#8000FF', '#FF00FF', '#FF0080'],
        'RGB 3': ['#FF0000', '#00FF00', '#0000FF'],
        Custom: ['#FF0000'],
    };
    const ColorSets = {
        ...ColorSetsFull,
    };
    delete ColorSets['Custom'];
    const HarmoniesFull = {
        Custom: [{}, { rotate: 60, rotateModulo: 60 }, { rotate: 120, rotateModulo: 60 }, { rotate: 180, rotateModulo: 60 }],
        Shades: [{}, { radiusStep: -0.99999 }, { radiusStep: -0.75 }, { radiusStep: -0.5 }, { radiusStep: -0.25 }],
        Complementary: [
            { children: [{ radiusOffset: -0.1 }, { radiusOffset: 0.1 }] },
            {
                rotate: 180,
                children: [
                    { rotate: 180, radiusOffset: -0.1 },
                    { rotate: 180, radiusOffset: 0.1 },
                ],
            },
        ],
        'Split Complementary': [{}, { rotate: 150 }, { rotate: 210 }],
        Triadic: [{}, { rotate: 120 }, { rotate: 240 }],
        Tetradic: [{}, { rotate: 90 }, { rotate: 180 }, { rotate: 270 }],
        Analagous: [{}, { rotate: 30 }, { rotate: 60 }, { rotate: 90 }],
    };

    const Harmonies: any = {
        ...HarmoniesFull,
    };
    delete Harmonies['Custom'];

    let pallete;
    let editHarmony = false;
    let editCustomColors = false;
    let harmony: any = HarmoniesFull['Complementary'];
    let rotation: number = 0;
    let tiers: number = 32;
    let skipinner: number = 2;
    let skipouter: number = 12;
    let wheelstart: number = 90;
    let intervals: number = 360;
    let showSettings = false;
    let blend: RGBBlendModes = blendModes[0];
    let colors = ColorSets['RYB 12'];
    let inner: string = '#FFFFFF';
    let tierblend: string = 'None';
    let outer: string = '#000000';
    let stroke: string = '';

    function Handler(e: any) {
        pallete = e.detail;
        pallete = pallete;
    }
    function ToggleSettings(e) {
        showSettings = !showSettings;
        e.stopPropagation();
        e.preventDefault();
    }
    function ShowSettings(e) {
        showSettings = true;
    }

    function HideSettings(e) {
        showSettings = false;
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

<div class="container">
    <div class="colors">
        {#if pallete}
            {#each pallete.alternates as t}
                <div class="group">
                    <div class="swatch" style:background={t.color}><span class="hex"> {t.color}</span></div>
                    {#if t.children?.length}
                        <div class="group">
                            {#each t.children as t2}
                                <div class="swatch" style:background={t2}><span class="hex"> {t2}</span></div>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/each}
        {/if}
    </div>
    <div class="widget">
        <ColorWheel {harmony} {colors} {rotation} {blend} {inner} {outer} {intervals} {tiers} {tierblend} {skipinner} {skipouter} {stroke} {wheelstart} on:update={Handler} />
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="close" class:active={showSettings} on:click={HideSettings} />
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="settings" class:active={showSettings} on:click={ShowSettings}>
        <h1 on:click={ToggleSettings}>Settings</h1>
        <div>
            <h2>Matching</h2>
            <Dropdown bind:value={harmony} options={HarmoniesFull}>
                <div slot="label" let:label class="flx row spread">
                    <span class="grow label">Harmony</span>
                    <span>{label}</span>
                </div>
                <div class="option" slot="option" let:label let:selected class:selected>
                    {label}
                </div>
            </Dropdown>
            {#if harmony == HarmoniesFull.Custom}
                <h3>Custom Harmony</h3>
                <button on:click={() => (editHarmony = !editHarmony)} class="wide secondary">{editHarmony ? 'Hide' : 'Show'} Harmony Config</button>
                <Flyout expanded={editHarmony} polling={100}>
                    <Dropdown options={Harmonies} on:select={CopyHarmony}>
                        <div slot="label" class="flx row spread secondary">Copy From</div>
                        <div class="option" slot="option" let:label let:selected class:selected>
                            {label}
                        </div>
                    </Dropdown>
                    <HarmonyList bind:harmony={HarmoniesFull.Custom} root={true} on:change={RefreshHarmony} />
                </Flyout>
            {/if}
        </div>
        <div>
            <h2>Pallete</h2>
            <Dropdown bind:value={colors} options={ColorSetsFull}>
                <div slot="label" let:label let:value class="flx row spread">
                    <span class="grow label">Radial ({label})</span>
                    <ColorBar colors={value} />
                </div>

                <div class="flx row spread option" slot="option" let:label let:value let:selected class:selected>
                    <span class="grow label">{label}</span>
                    <ColorBar colors={value} />
                </div>
            </Dropdown>
            {#if colors == ColorSetsFull.Custom}
                <button on:click={() => (editCustomColors = !editCustomColors)} class="wide secondary">{editCustomColors ? 'Hide' : 'Show'} Color Config</button>
                <Flyout expanded={editCustomColors} polling={100}>
                    <Dropdown options={ColorSets} on:select={CopyColors}>
                        <div slot="label" class="flx row spread secondary">Copy From</div>
                        <div class="flx row spread option" slot="option" let:label let:value let:selected class:selected>
                            <span class="grow label">{label}</span>
                            <ColorBar colors={value} />
                        </div>
                    </Dropdown>
                    {#each ColorSetsFull.Custom as c, i}
                        <ColorPicker bind:value={c} required={i == 0} on:blur={RefreshColors} on:reset={RefreshColors} />
                    {/each}

                    <button
                        class="wide"
                        on:click={() => {
                            ColorSetsFull.Custom.push('#FFFFFF');
                            RefreshColors();
                        }}>+</button
                    >
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
            <Dropdown bind:value={blend} options={blendModes}>
                <div slot="label" let:value class="flx row spread">
                    <span class="grow label">Blend Mode</span>
                    <div>{value}</div>
                </div>

                <div class="option" slot="option" let:value let:selected class:selected>
                    {value}
                </div>
            </Dropdown>
        </div>

        <div>
            <h2>Resolution</h2>
            <div class="flx row spread">
                <span class="grow label">Intervals</span>
                <Number bind:value={intervals} />
            </div>
            <div class="flx row spread">
                <span class="grow label">Tiers</span>
                <Number bind:value={tiers} />
            </div>
            <Dropdown bind:value={tierblend} options={tierblends}>
                <div slot="label" let:value class="flx row spread">
                    <span class="grow label">Tier Blend</span>
                    <div>{value}</div>
                </div>
                <div class="option" slot="option" let:value let:selected class:selected>
                    {value}
                </div>
            </Dropdown>
            <div class="flx row spread">
                <span class="grow label">Skip Inner Tiers</span>
                <Number bind:value={skipinner} />
            </div>
            <div class="flx row spread">
                <span class="grow label">Skip Outer Tiers</span>
                <Number bind:value={skipouter} />
            </div>
        </div>
    </div>
</div>

<style lang="scss">
    h1 {
        cursor: pointer;
        margin: 0;
        padding: 0;
        height: 60px;
        line-height: 60px;
    }
    h2 {
        padding: 0;
        margin: 0;
        margin-top: 24px;
        border-bottom: solid 1px #aaa;
    }
    .container {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .widget {
        margin: auto;
        height: calc(90vmin - 25px);
        aspect-ratio: 1;
        box-sizing: border-box;
    }

    .secondary {
        font-style: italic;
        color: #eee;
    }
    .colors {
        position: absolute;
        width: 100%;
        display: flex;
        flex-flow: column;

        top: 0;
        bottom: 0;
        height: auto;
        z-index: 0;

        .group {
            display: flex;
            flex-flow: column;
            height: 100%;
            margin-right: 0;
        }
    }
    .swatch {
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0);
        transition: all 350ms;
        position: relative;
        &:before {
            content: ' ';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 20%, #111 65%);
        }
        .hex {
            display: inline-block;
            margin: 4px;
            font-weight: 600;
            mix-blend-mode: hard-light;
            background: #333;
            padding: 4px 8px;
        }
    }
    div {
        display: block;
    }
    .close.active {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
    .settings {
        background: #111;
        position: absolute;
        right: -15%;
        width: 30%;
        top: 0;
        bottom: 0;
        overflow: hidden;
        z-index: 1;
        opacity: 0.4;
        transition: all 350ms;
        padding: 0 20px 60px;
        box-sizing: border-box;
        z-index: 100;
        -ms-overflow-style: none; /* Internet Explorer 10+ */
        scrollbar-width: none; /* Firefox */
        &::-webkit-scrollbar {
            display: none; /* Safari and Chrome */
        }
        &.active {
            opacity: 1;
            overflow: auto;
            right: 0px;
        }
    }

    .spread {
        padding: 4px 0;
        gap: 12px;
        .label {
            min-width: 30%;
            font-size: 1.25em;
        }
    }
    button.wide {
        background: none;
        border: none;
        appearance: none;
        width: 100%;
        height: 2em;
        color: #fff;
        cursor: pointer;
        &:focus {
            outline: none;
        }
    }
    .option {
        padding: 8px;
        transition: all 200ms;
        background: #111;

        &::before {
            content: ' ';
            display: inline-block;
            width: 15px;
        }
        &:hover {
            background: #555;
        }
        &.selected {
            &::before {
                content: '▸';
            }
        }
    }
    @media (orientation: portrait) {
        .colors {
            bottom: 60px;
        }
        .settings {
            left: 0;
            right: 0;
            width: 100%;
            top: calc(100vh - 60px);
            background: rgba(0, 0, 0, 0.2);
            &.active {
                top: 0;
                background: #111;
            }
        }
    }
</style>
