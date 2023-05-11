<script lang="ts">
    import "./styles.css"; /* import styles which cannot be removed across interpreted as unused by PurgeCSS  */
    import { PUBLIC_MAP_API_KEY, PUBLIC_MAP_ID } from "$env/static/public";
    import { onMount } from "svelte";
    import OptionsStripe from "$lib/OptionsStripe.svelte";
    import CreateNewAirline from "$lib/CreateNewAirline.svelte"
    import UpperStripe from "$lib/UpperStripe.svelte";
    import PlanesMarket from "$lib/PlanesMarket.svelte";
    import CreateRoute from "$lib/CreateRoute.svelte";
    import { mapLoader } from "$lib/api";
    import { userData as data, type UserData, type Route } from "$lib/storages/interim";

    async function addMap() {
        // Example location
        const position = { lat: 52.237049, lng: 21.017532 };

        // Initialise auth data for Google Maps library
        const loader = await mapLoader();

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

    function creatingAirlineWhenNotExistsYet() {
        const airlineCreation = new CreateNewAirline({
            target: document.body
        });

        // Listen for moment when user pass all data from this menu and click to "Accept and to next step" button
        airlineCreation.$on("to-next-step", ({ detail: newGameObject }) => {
            // Update existing (or no) game data
            data.update(val => {
                return {
                    ...val,
                    ...newGameObject
                }
            });
            
            // Delete menu and redirect user to new step
            airlineCreation.$destroy();

            // Selecting and buying new plane/planes step
            const planesMarket = new PlanesMarket({
                target: document.getElementsByClassName("map")[0],
                props: {
                    spawnedDurningCreationOfAirline: true
                }
            });

            // When user bought any plane (or more then one) click on 'Go to next step' located on stripe from above menu then redirect user to next step by spawning next step menu
            planesMarket.$on("airline-creation-go-to-next-step", () => {
                // Redirect user to next step only when bought any (or more then one) plane
                if ($data?.fleet.length) {
                    // Destroy planes market svelte component
                    planesMarket.$destroy();
                    
                    // Creating new route for plane
                    const routeModule = new CreateRoute({
                        target: document.getElementsByClassName("map")[0]
                    });

                    // When user created new route then add this route to user airline routes list from 'userData' storage
                    routeModule.$on("created-route", ({ detail: route }: { detail: Route }) => {
                        // Add route what will be automatically annotated by Svelte reactivity
                        ($data as UserData).routes = [route];

                        // Destroy svelte route component
                        routeModule.$destroy();

                        // Display final alert that: User created new airline
                        alert("Congratulations you created new airline!");
                    });
                }
                else alert("You must buy any plane to go ahead!");
            });
        });
    }

    // Must be probably performed in this way because is some way durning puting it into global scope i've got an error caused by 'no "window" object'
    onMount(() => {
        // Load to storage data from user browswer 'localStorage' space when airline-manager data was saved into it prior
        data.loadStorageFromUserBrowswer();
        if (!($data)) creatingAirlineWhenNotExistsYet();

        // addMap();
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
        position: relative;
    }

    div.map {
        position: absolute;
        top: 50px;
        width: 100%;
        height: calc(100% - 100px); /* 100% of y axis view - 2 * height of stripes */
    }
</style>
