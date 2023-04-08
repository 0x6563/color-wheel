<script lang="ts">
    import ColorWheel from '@components/color-wheel.svelte';
    import { RGBBlending, type RGBBlender } from '@services/color';
    import Dropdown from '@components/inputs/dropdown.svelte';
    import Number from '@components/inputs/number.svelte';
    import ColorPicker from '@components/inputs/color-picker.svelte';
    import ColorBar from '@components/color-bar.svelte';
    import HarmonyList from '@components/inputs/harmony-list.svelte';
    import Flyout from '@components/flyout.svelte';
    import { RGB } from '@services/colorspace/rgb';
    import { CopyToClipboard } from '@services/clipboard';
    import Icon from '@components/icon.svelte';
    import ColorShade from '@components/color-shade.svelte';
    import { browser } from '$app/environment';
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
        Custom: [{}, { rotate: 60, rotateModulo: 60 }, { rotate: 120, rotateModulo: 60 }, { rotate: 180, rotateModulo: 60 }],
        Shades: [{}, { scaleRelative: -0.99999 }, { scaleRelative: -0.75 }, { scaleRelative: -0.5 }, { scaleRelative: -0.25 }],
        Complementary: [
            { children: [{ scaleAbsolute: -0.1 }, { scaleAbsolute: 0.1 }] },
            {
                rotate: 180,
                children: [
                    { rotate: 180, scaleAbsolute: -0.1 },
                    { rotate: 180, scaleAbsolute: 0.1 },
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
    let theme: 'light' | 'dark' = browser && window && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    let pallete;
    let colorpicking: 'Calculated' | 'Rendered' = 'Calculated';
    let editHarmony = false;
    let editCustomColors = false;
    let harmony: any = HarmoniesFull['Complementary'];
    let renderrotation: number = 0;
    let tiers: number = 1;
    let skipinner: number = 0;
    let skipouter: number = 0;
    let wheelrotation: number = 0;
    let slices: number = 12;
    let showSettings = false;
    let blender: RGBBlender = RGBBlending.LAB;
    let colors = ColorSets['RYB 12'];
    let inner: string = '#ffffff';
    let blend: 'Smooth' | 'None' = 'Smooth';
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

<div id="app" class:light={theme == 'light'} class:dark={theme == 'dark'}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="container">
        <div class="colors">
            {#if pallete}
                {#each pallete.translations as { children, color }}
                    <div class="group">
                        <div class="swatch" style:background={color}>
                            <ColorShade>
                                <span class="hex" on:click={() => CopyToClipboard(color)}>
                                    <span class="code"> {color}</span><Icon icon="content_copy" align="bottom" />
                                </span>
                            </ColorShade>
                        </div>
                        {#if children?.length}
                            <div class="group">
                                {#each children as color}
                                    <div class="swatch" style:background={color}>
                                        <ColorShade>
                                            <span class="hex" on:click={() => CopyToClipboard(color)}>
                                                <span class="code"> {color}</span><Icon icon="content_copy" align="bottom" />
                                            </span>
                                        </ColorShade>
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>
                {/each}
            {/if}
        </div>
        <div class="widget">
            <ColorWheel {harmony} {colors} {colorpicking} {renderrotation} {blender} {inner} {outer} {slices} {tiers} {blend} {skipinner} {skipouter} {stroke} {wheelrotation} on:update={Handler} />
        </div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="close" class:active={showSettings} on:click={HideSettings} />
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="settings" class:active={showSettings} on:click={ShowSettings}>
            <h1 on:click={ToggleSettings}>Color Wheel</h1>
            <a href="https://github.com/0x6563" target="_blank" class="hint">by 0x6563</a>
            <div>
                <h2>General</h2>
                <div class="flx row spread">
                    <div class="label">Theme</div>
                    {#if theme == 'dark'}
                        <button class="btn" on:click={() => (theme = 'light')}>Dark Mode <Icon icon="dark_mode" align="bottom" /> </button>
                    {:else}
                        <button class="btn" on:click={() => (theme = 'dark')}>Light Mode <Icon icon="light_mode" align="bottom" /> </button>
                    {/if}
                </div>
                <div class="flx row spread">
                    <span class="label">Donate</span>
                    <a href="https://www.buymeacoffee.com/0x6563" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" height="38px" alt="Buy Me A Coffee" /></a>
                </div>
                <h2>Settings</h2>

                <h3>Matching</h3>
                <Dropdown bind:value={colorpicking} options={picks}>
                    <div slot="label" let:label class="flx row spread">
                        <span class="grow label">Color Picking</span>
                        <span>{label}</span>
                    </div>
                    <div class="option" slot="option" let:label let:selected class:selected>
                        {label}
                        {#if label == 'Rendered'}
                            <div class="hint">Use pixel data from the rendered color wheel.</div>
                        {/if}
                        {#if label == 'Calculated'}
                            <div class="hint">Use angle and percentage of radius to calculate color.</div>
                        {/if}
                    </div>
                </Dropdown>
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
                    <button on:click={() => (editHarmony = !editHarmony)} class="wide hint">{editHarmony ? 'Hide' : 'Show'} Harmony Config</button>
                    <Flyout expanded={editHarmony} polling={100}>
                        <h4>Custom Harmony</h4>
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
                <h3>Pallete</h3>
                <Dropdown bind:value={colors} options={ColorSetsFull}>
                    <div slot="label" let:label let:value class="flx row spread">
                        <span class="grow label">Colors ({label})</span>
                        <ColorBar colors={value} />
                    </div>

                    <div class="flx row spread option" slot="option" let:label let:value let:selected class:selected>
                        <span class="grow label">{label}</span>
                        <ColorBar colors={value} />
                    </div>
                </Dropdown>
                {#if colors == ColorSetsFull.Custom}
                    <button on:click={() => (editCustomColors = !editCustomColors)} class="wide hint">{editCustomColors ? 'Hide' : 'Show'} Color Config</button>
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
                <Dropdown bind:value={blender} options={RGBBlending}>
                    <div slot="label" let:label class="flx row spread">
                        <span class="grow label">Blending Algorithm</span>
                        <div>{label}</div>
                    </div>

                    <div class="option" slot="option" let:label let:selected class:selected>
                        {label}
                    </div>
                </Dropdown>
            </div>

            <div>
                <h3>Resolution</h3>

                <Dropdown bind:value={blend} options={blends}>
                    <div slot="label" let:value class="flx row spread">
                        <span class="grow label">Blend ({value})</span>
                        <ColorBar {colors} blend={value} />
                    </div>
                    <div slot="option" class="flx row spread option" let:value let:selected class:selected>
                        <span class="grow label">{value}</span>
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
                <div class="hint">Excluding Inner and Outer colors.</div>

                <div class="flx row spread">
                    <span class="grow label">Skip Inner Tiers</span>
                    <Number bind:value={skipinner} />
                </div>
                <div class="flx row spread">
                    <span class="grow label">Skip Outer Tiers</span>
                    <Number bind:value={skipouter} />
                </div>
            </div>
            <h2>About</h2>
            <a href="https://github.com/0x6563/color-wheel/issues">Having Issues?</a>
        </div>
    </div>
</div>

<style lang="scss">
    h1 {
        margin: 0;
        padding: 0;
        height: 60px;
        line-height: 60px;
    }
    h4 {
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
        color: var(--light-stroke);
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
    .hint {
        font-size: 0.75em;
        color: var(--light-stroke);
        font-style: italic;
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
            background: linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 20%, var(--fill) 65%);
            transition: all 350ms;
        }
        .hex {
            font-weight: 600;
            padding: 4px 8px;
            display: inline-block;
        }
        :global(.shade) {
            position: absolute;
            top: 4px;
            left: 4px;
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
        background: var(--fill);
        position: absolute;
        right: -15%;
        width: 30%;
        top: 0;
        bottom: 0;
        overflow: hidden;
        z-index: 1;
        transition: all 350ms;
        padding: 0 20px 60px;
        box-sizing: border-box;
        z-index: 100;
        -ms-overflow-style: none; /* Internet Explorer 10+ */
        scrollbar-width: none; /* Firefox */
        box-shadow: 0px 0px 0px black;
        & > * {
            opacity: 0.4;
            pointer-events: none;
        }
        &::-webkit-scrollbar {
            display: none; /* Safari and Chrome */
        }
        &.active {
            & > * {
                opacity: 1;
                pointer-events: initial;
            }

            overflow: auto;
            right: 0px;
            box-shadow: 0px 0px 5px 1px black;
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
        color: var(--stroke);
        cursor: pointer;
        &:focus {
            outline: none;
        }
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
    @media (orientation: portrait) {
        .colors {
            bottom: 60px;
        }
        .settings {
            left: 0;
            right: 0;
            width: 100%;
            top: calc(100vh - 60px);
            &.active {
                top: 0;
            }
        }
    }
</style>
