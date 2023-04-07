<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import HarmonyList from './harmony-list.svelte';
    import Number from './number.svelte';
    export let harmony: Harmony = {};
    export let root: boolean = false;
    interface Harmony {
        rotate?: number;
        rotateModulo?: number;
        scaleAbsolute?: number;
        scaleRelative?: number;
        children?: Harmony[];
    }

    const dispatch = createEventDispatcher();
    function onChange() {
        dispatch('change');
    }
</script>

<div class="group" class:extendable={root}>
    <div class="flx column">
        <div class="section flx row spread">
            <span class="label">Angle</span>
            <Number bind:value={harmony.rotate} on:change={onChange} min={-360} max={360} />
        </div>
        <div class="section flx row spread">
            <span class="label">Modulus</span>
            <Number bind:value={harmony.rotateModulo} on:change={onChange} min={0} max={360} />
        </div>
        <div class="section flx row spread">
            <span class="label">Scale Absolute</span>
            <Number bind:value={harmony.scaleAbsolute} on:change={onChange} min={-1} max={1} step={0.01} />
        </div>
        <div class="section flx row spread">
            <span class="label">Scale Relative</span>
            <Number bind:value={harmony.scaleRelative} on:change={onChange} min={-1} max={1} step={0.01} />
        </div>
    </div>

    {#if root}
        <HarmonyList bind:harmony={harmony.children} on:change={onChange} />
    {/if}
</div>

<style lang="scss">
    .group {
        display: block;
        flex: 1 1 auto;
        padding: 8px 0;
    }
    .section {
        text-align: center;
        :global(input) {
            text-align: center;
        }
    }
</style>
