<script lang="ts">
    import { Store, Plane, FlightInternational, ChartLine } from "carbon-icons-svelte"

    let iconsSize = 28 as 24 | 32;
</script>

<div class="options-stripe">
    <button id="market" title="market">
        <Store size={iconsSize}/>
    </button>
    <button id="fleet" title="fleet">
        <Plane size={iconsSize}/>
    </button>
    <button id="routes" title="routes">
        <FlightInternational size={iconsSize}/>
    </button>
    <button id="analisys" title="analisys">
        <ChartLine size={iconsSize}/>
    </button>
</div>

<style>
    button {
        width: calc(100% / 4);
        font-size: 25px;
        font-family: 'Roboto', sans-serif;
        color: white;
        outline: none;
        border: none;
        background-color: transparent;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }

    button:hover {
        background-color: var(--color-hover);
    }

    .options-stripe {
        width: 100%;
        height: 50px;
        display: flex;
        justify-content: space-between;
        position: absolute;
        bottom: 0px;
        right: 0px;
        background-color: var(--color);
    }
</style>
