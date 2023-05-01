<script lang="ts">
    import "./styles.css"; /* import styles which cannot be removed across interpreted as unused by PurgeCSS  */
    import { PUBLIC_MAP_API_KEY, PUBLIC_MAP_ID } from "$env/static/public";
    import { onMount } from "svelte";
    import OptionsStripe from "$lib/OptionsStripe.svelte";
    import UpperStripe from "$lib/UpperStripe.svelte";
    import { Loader } from "@googlemaps/js-api-loader";

    let gameCanvas: HTMLCanvasElement;

    async function addMap() {
        // Example location
        const position = { lat: 52.237049, lng: 21.017532 };

        // Initialise auth data for Google Maps library
        const loaded = await new Loader({
            apiKey: PUBLIC_MAP_API_KEY,
            version: "weekly"
        }).load();

        // Load Google Maps Library
        const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        const mapContainer = document.getElementsByClassName("map")[0];
        const map = new Map(mapContainer as HTMLElement, {
            maxZoom: 11,
            minZoom: 5,
            center: position,
            zoom: 8,
            mapId: PUBLIC_MAP_ID
        });

        // Add to map container canvas created
        // FIXME: Canvas elminates possibliity to move/zoom on map
        /* const canvas = document.createElement("canvas");
        mapContainer.appendChild(canvas);

        // Assign created canvas as a global vartiable
        gameCanvas = canvas; */
    }

    // Must be probably performed in this way because is some way durning puting it into global scope i've got an error caused by 'no "window" object'
    onMount(() => {
        addMap();
    })
</script>

<div class="app">
    <UpperStripe/>
    <div class="map">
    </div>
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

    div.map {
        position: absolute;
        top: 50px;
        width: 100%;
        height: calc(100% - 100px); /* 100% of y axis view - 2 * height of stripes */
    }
</style>
