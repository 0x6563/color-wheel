<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Harmony from './harmony.svelte';
    export let harmony: Harmony[] = [];
    export let root: boolean = false;
    const dispatch = createEventDispatcher();
    interface Harmony {
        rotate?: number;
        rotateModulo?: number;
        scaleAbsolute?: number;
        scaleRelative?: number;
        children?: Harmony[];
    }
    function Extend() {
        if (!harmony) {
            harmony = [];
        }
        harmony.push({});
        harmony = harmony;
        dispatch('change');
    }
    function Delete(h: Harmony) {
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
        {#if root}
            Primary
        {:else}
            Secondary
        {/if}
    </h4>
    {#if harmony}
            {#each harmony as h, i}
                <div class="flx row item spread">
                    <div class="side">
                        {#if !root || i > 0}
                            <button class="delete" on:click={Delete(h)}></button>
                        {/if}
                    </div>
                    <Harmony bind:harmony={h} {root} on:change={() => dispatch('change')} />
                </div>
            {/each}
    {/if}
    <button class="extend" on:click={Extend}>+</button>
    <div class="hr" />
</div>

<style lang="scss">
    h4 {
        text-align: left;
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
        color: #fff;
        cursor: pointer;
    }
    .delete {
        position: absolute;
        top: 6px;
        left: 6px;
        width: 24px;
        height: 24px;
        font-size: 24px;
    }
    .extend {
        width: 100%;
        text-align: center;
        font-weight: 700;
        padding: 8px 0;
    }
    
    .delete {
        mix-blend-mode: lighten;

        cursor: pointer;

        &:before,
        &:after {
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            margin: auto;
            content: ' ';
            height: 75%;
            max-height: 40px;
            width: 2px;
            background-color: #aaa;
            transition: all 200ms;
        }
        &:before {
            transform: rotate(45deg);
        }
        &:after {
            transform: rotate(-45deg);
        }
        &:hover {
            &:before,
            &:after {
                background-color: #ccc;
            }
        }
    }
</style>
