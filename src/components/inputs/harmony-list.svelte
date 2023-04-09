<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Harmony from './harmony.svelte';
    import Icon from '@components/icon.svelte';
    export let harmony: HarmonyTranslation[] = [];
    export let root: boolean = false;
    const dispatch = createEventDispatcher();
    interface HarmonyTranslation {
        scale?: string;
        angle?: string;
        children?: HarmonyTranslation[];
    }
    function Extend() {
        if (!harmony) {
            harmony = [];
        }
        harmony.push({});
        harmony = harmony;
        dispatch('change');
    }
    function Delete(h: HarmonyTranslation) {
        return () => {
            const i = harmony.indexOf(h);
            if (i >= 0) {
                harmony = [...harmony.slice(0, i), ...harmony.slice(i + 1)];
                dispatch('change');
            }
        };
    }
</script>

<div class="group">
    <h4>
        {#if !root}
            Related
        {/if}
    </h4>
    {#if harmony}
        {#each harmony as h, i}
            <div class="flx row item spread">
                <div class="side">
                    {#if !root || i > 0}
                        <button class="delete" on:click={Delete(h)}><Icon icon="delete" /></button>
                    {/if}
                </div>
                <Harmony bind:harmony={h} {root} disabled={root && i == 0} on:change={() => dispatch('change')} />
            </div>
        {/each}
    {/if}
    <button class="extend" on:click={Extend}><Icon icon="add_circle" align="top" /></button>
    <div class="hr" />
</div>

<style lang="scss">
    h4 {
        text-align: left;
        margin: 12px 0 4px 0;
    }
    .group {
        width: 100%;
        flex: 1 1 auto;
    }
    .item {
        position: relative;
        width: 100%;
    }
    .side {
        width: 36px;
    }
    button {
        border: none;
        background: none;
        color: var(--stroke);
        cursor: pointer;
    }
    .delete {
        position: absolute;
        padding: 0;
        text-align: center;
        top: 16px;
        width: 24px;
        height: 24px;
        font-size: 18px;
    }
    .extend {
        width: 100%;
        text-align: center;
        height: 1.5em;
        font-size: 1.5em;
        margin: 4px;
    }

    .delete {
        mix-blend-mode: lighten;
        cursor: pointer;
    }
</style>
