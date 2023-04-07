<script lang="ts">
    import { afterUpdate, onMount } from 'svelte';

    export let colors: string[] = [];
    export let blend: 'None' | 'Smooth' = 'None';
    let canvas: HTMLCanvasElement;
    let event;
    $: event = { blend, colors } && Draw();
    onMount(() => {
        Draw();
    });
    afterUpdate(() => {
        Draw();
    });

    function Draw() {
        if (blend == 'None' || !canvas || colors.length <= 1) {
            return;
        }

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        context.clearRect(0, 0, canvas.width, canvas.height);
        const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);

        const step = 1 / (colors.length - 1);
        for (let i = 0; i < colors.length; i++) {
            gradient.addColorStop(Math.min(1, step * i), colors[i]);
        }
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
</script>

{#if blend == 'None' || colors.length <= 1}
    <span class="bar">
        {#each colors as color}
            <span class="color" style:background={color} />
        {/each}
    </span>
{:else}
    <canvas bind:this={canvas} height="20" width="100" />
{/if}

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
    canvas {
        width: 100%;
        height: 20px;
    }
</style>
