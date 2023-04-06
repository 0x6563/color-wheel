<script lang="ts">
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
            <button on:click={Reset}>
                <span class="shade" />
                <span class="reset" />
            </button>
        {/if}
        <label style:background={value || '#444'} class:empty={!value}>
            <input type="color" bind:value on:blur={EventFactory('blur')} on:change={EventFactory('change')} />
            {#if value}
                <span class="color">
                    <span class="shade" />
                    <span class="hex">
                        {value}
                    </span>
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
    .color,
    button {
        position: absolute;
        display: block;
        height: 100%;
        top: 0;
        background: none;
    }
    .color {
        width: 100px;
        color: #eee;
    }
    button {
        border: none;
        right: 0;
        width: 40px;
    }
    .shade,
    .reset,
    .hex {
        position: absolute;
        right: 0;
        left: 0;
        top: 0;
        bottom: 0;
        margin: auto;
        text-align: center;
    }
    .color .shade {
        left: 6px;
        right: 6px;
        top: 4px;
        bottom: 4px;
    }
    .shade {
        mix-blend-mode: multiply;
        background: #444;
    }
    .hex {
        mix-blend-mode: lighten;
    }
    .reset {
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
