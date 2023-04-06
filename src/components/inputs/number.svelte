<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let value = 0;
    export let min: number | undefined = undefined;
    export let max: number | undefined = undefined;
    export let step: number | undefined = undefined;
    let decimals = 0;
    $: decimals = ((step || 0).toString().split('.')[1] || '').length;
    const dispatch = createEventDispatcher();
    function format() {
        console.log(decimals);
        if (decimals && value.toFixed(decimals) != value.toString()) {
            value = value.toFixed(decimals) as any;
        }
    }
</script>

<input type="number" class="shrink" bind:value {min} {max} {step} on:change={() => dispatch('change')} on:keypress={format} />

<style lang="scss">
    input {
        display: inline-block;
        width: 100%;
        height: 20px;
        text-align: right;
        appearance: none;
        background: inherit;
        border-radius: 0;
        color: #fff;
        border: none;
        font-style: italic;
        font-size: 1em;
        padding-right: 4px;
        &:hover,
        &:focus {
            color: #1abaff;
            outline: none;
        }
        -moz-appearance: textfield;
    }
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
</style>
