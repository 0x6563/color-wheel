<script lang="ts">
    import ColorWheel from '@components/color-wheel.svelte';
    import Number from '@components/inputs/number.svelte';
    import { CopyToClipboard } from '@services/clipboard';
    import Icon from '@components/icon.svelte';
    import ColorShade from '@components/color-shade.svelte';
    import { browser } from '$app/environment';
    import Settings from '@components/inputs/settings.svelte';
    import type { RGBBlender } from '@services/color';

    let theme: 'light' | 'dark' = browser && window && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    let pallete;
    let wheelrotation: number = 0;
    let renderrotation: number = 0;
    let showSettings = false;

    let colorpicking: 'Calculated' | 'Rendered';
    let harmony: any;
    let tiers: number;
    let skipinner: number;
    let skipouter: number;
    let slices: number;
    let blender: RGBBlender;
    let colors;
    let inner: string;
    let blend: 'Smooth' | 'None';
    let outer: string;
    let stroke: string;

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
</script>

<svelte:head>
    <title>Color Wheel by 0x6563</title>
</svelte:head>

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
        {#if blend}
            <div class="widget">
                <ColorWheel {harmony} {colors} {colorpicking} {renderrotation} {blender} {inner} {outer} {slices} {tiers} {blend} {skipinner} {skipouter} {stroke} {wheelrotation} on:update={Handler} />
            </div>
        {/if}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="close" class:active={showSettings} on:click={HideSettings} />
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="settings" class:active={showSettings} on:click={ShowSettings}>
            <h1 on:click={ToggleSettings}>Color Wheel</h1>
            <a href="https://github.com/0x6563" target="_blank" class="subtext">by 0x6563</a>
            <div class="section">
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
                    <a href="https://www.buymeacoffee.com/0x6563" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" height="32px" alt="Buy Me A Coffee" /></a>
                </div>
            </div>
            <div class="section">
                <h2>Settings</h2>
                <Settings bind:colorpicking bind:harmony bind:tiers bind:skipinner bind:skipouter bind:slices bind:blender bind:colors bind:inner bind:blend bind:outer bind:stroke />
            </div>
            <div class="section">
                <h2>About</h2>
                <a href="https://github.com/0x6563/color-wheel/issues">Having Issues?</a>
            </div>
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
    h2 {
        padding: 0;
        margin: 48px 0 4px;
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

    .row {
        min-height: 32px;
        margin: 4px 0;
    }

    .spread {
        gap: 12px;
        .label {
            width: 30%;
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
