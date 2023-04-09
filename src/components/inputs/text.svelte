<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let ifnull: string = '';
    export let value: string = '';
    export let disabled = false;
    export let classes = '';
    export let placeholder = '';
    const dispatch = createEventDispatcher();

    value = value || ifnull;
    function blur(e) {
        value = value || ifnull;
        dispatch('blur', e);
    }
    function change(e) {
        dispatch('change', e);
    }
</script>

<input type="text" class={classes} bind:value on:blur={blur} on:change={change} {disabled} {placeholder} />

<style lang="scss">
    input {
        background: none;
        outline: none;
        border: none;
        display: inline-block;
        height: 32px;
        line-height: 32px;
        &:disabled {
            color: var(--light-fill);
        }
    }
</style>
