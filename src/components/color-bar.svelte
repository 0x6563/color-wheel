<script lang="ts">
    export let colors: string[] = [];
</script>

<span class="bar">
    {#each colors as color}
        <span class="color" style:background={color} />
    {/each}
</span>

<style lang="scss">
    .bar {
        display: inline-flex;
        width: 100%;
    }
    .color {
        display: block;
        height: 20px;
        width: 100%;
        flex: 1 1 auto;
    }
</style>
