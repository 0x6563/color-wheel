<script lang="ts">
    import ColorShade from '@components/color-shade.svelte';
    import Icon from '@components/icon.svelte';
    import { createEventDispatcher } from 'svelte';

    export let value: string = '';
    export let required: boolean = false;
    const dispatch = createEventDispatcher();
    function EventFactory(type) {
        return (e) => dispatch(type, value);
    }
    function Reset() {
        value = '';
        dispatch('reset');
    }
</script>

<span class="wrap">
    <span class="inner">
        {#if value && !required}
            <button class="reset" on:click={Reset}>
                <ColorShade>
                    <Icon icon="close" />
                </ColorShade>
            </button>
        {/if}
        <label style:background={value || 'var(--light-fill)'} class:empty={!value}>
            <input type="color" bind:value on:blur={EventFactory('blur')} on:change={EventFactory('change')} />
            {#if value}
                <span class="hex">
                    <ColorShade>
                        {value}
                    </ColorShade>
                </span>
            {/if}
        </label>
    </span>
</span>

<style lang="scss">
    label {
        height: 32px;
        display: inline-block;
        width: 100%;
        font-style: italic;
        line-height: 32px;
        cursor: pointer;
        transition: all 300ms;
        &.empty {
            &:before {
                position: absolute;
                left: 10px;
                top: 0;
                right: 10px;
                bottom: 0;
                margin: auto;
                content: ' ';
                height: 1px;
                background-color: #fe6262;
            }
        }
    }
    input {
        height: 0;
        width: 0;
        opacity: 0;
    }
    .wrap {
        width: 100%;
        display: inline-block;
        padding: 6px 0;
    }
    .inner {
        position: relative;
        display: inline-block;
        width: 100%;
        box-sizing: border-box;
    }
    .hex {
        position: absolute;
        left: 4px;
        top: 4px;
        bottom: 4px;
        width: 100px;
    }
    .reset {
        position: absolute;
        display: block;

        background: none;
        border: none;
        top: 0;
        right: 0;
        bottom: 0;
        width: 40px;
        font-size: 24px;
    }
    .hex,
    .reset {
        :global(.shade) {
            text-align: center;
            line-height: 24px;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
        }
    }
</style>
