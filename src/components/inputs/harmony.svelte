<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import HarmonyList from './harmony-list.svelte';
    import Text from './text.svelte';
    export let harmony: Harmony = {};
    export let root: boolean = false;
    export let disabled = false;
    interface Harmony {
        angle?: string;
        scale?: string;
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
            <span class="flx grow">
                = <Text classes="grow variable" bind:value={harmony.angle} on:change={onChange} {disabled} ifnull="angle" />
            </span>
        </div>
        <div class="section flx row spread">
            <span class="label">Scale</span>
            <span class="flx grow">
                = <Text classes="grow variable" bind:value={harmony.scale} on:change={onChange} {disabled} ifnull="scale" />
            </span>
        </div>
    </div>

    {#if root}
        <HarmonyList bind:harmony={harmony.children} on:change={onChange} />
    {/if}
</div>

<style lang="scss">
    .row {
        min-height: 32px;
    }
    .label {
        width: 10ch;
    }
    .group {
        display: block;
        flex: 1 1 auto;
        padding: 8px 0;
    }
    .section {
        text-align: center;
        :global(input) {
            text-align: right;
        }
    }
</style>
