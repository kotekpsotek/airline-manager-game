<script lang="ts">
    import OptionsStripe from "$lib/OptionsStripe.svelte";
    import UpperStripe from "$lib/UpperStripe.svelte";

    let gameCanvas: HTMLCanvasElement;
</script>

<div class="app">
    <UpperStripe/>
    <canvas bind:this={gameCanvas}></canvas>
    <OptionsStripe/>
</div>

<style>
    /* Font for whole application */
    @import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
    
    /* Application container */
    .app {
        --color: rgb(22, 115, 237);
        --color-hover: rgb(19, 96, 197);
        font-family: 'Roboto', sans-serif;
        width: 100%;
        height: 100%;
        background-color: whitesmoke;
    }

    canvas {
        position: absolute;
        top: 50px;
        width: 100%;
        height: calc(100% - 100px); /* 100% of y axis view - 2 * height of stripes */
    }
</style>
