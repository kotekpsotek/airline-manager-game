<script lang="ts">
    import { Store, Plane, FlightInternational, ChartLine } from "carbon-icons-svelte"
    import PlanesMarket from "$lib/PlanesMarket.svelte";
    import UserRoutes from "$lib/UserRoutes.svelte";
    import UserPlanesFleet from "$lib/UserPlanesFleet.svelte";
    import { clearMainAppFieldFromAnyComponents } from "$lib/api";

    let iconsSize = 28 as 24 | 32;
    let statusDisplaying: "planes-market" | "user-routes" | "user fleet" | null = null;

    /** Create planes market = add it to main application field */
    function createPlanesMarket(ev: Event) {
        if (statusDisplaying != "planes-market") {
            // Clear other components spawned prior
            clearMainAppFieldFromAnyComponents();
            
            // Add planes market when user already is not displaying it
            statusDisplaying = "planes-market";
            
            const planesMarket = new PlanesMarket({
                target: document.getElementsByClassName("map")[0]
            });
        }
        else {
            // Destroy planes market component and reset it status when user already is displaying it
            clearMainAppFieldFromAnyComponents();
            statusDisplaying = null;
        }
    }

    /** Spawn component with list of user routes and ability to manage user routes */
    function createRoutesList(ev: Event) {
        if (statusDisplaying != "user-routes") {
            // Clear other components spawned prior
            clearMainAppFieldFromAnyComponents();
            
            // Add planes market when user already is not displaying it
            statusDisplaying = "user-routes";
            
            const userRoutes = new UserRoutes({
                target: document.getElementsByClassName("map")[0]
            });
        }
        else {
            // Destroy planes market component and reset it status when user already is displaying it
            clearMainAppFieldFromAnyComponents();
            statusDisplaying = null;
        }
    }

    /** Create GUI overview for user planes fleet by spawning GUI html component */
    function createFleetList(ev: Event) {
        if (statusDisplaying != "user fleet") {
            // Clear other components spawned prior
            clearMainAppFieldFromAnyComponents();

            // Add planes fleet when user already is not displaying it
            statusDisplaying = "user fleet";

            const userFleet = new UserPlanesFleet({
                target: document.getElementsByClassName("map")[0]
            })
        } 
        else {
            // Destroy planes market component and reset it status when user already is displaying it
            clearMainAppFieldFromAnyComponents();
            statusDisplaying = null;
        }
    }
</script>

<div class="options-stripe">
    <button id="market" title="market" on:click={createPlanesMarket}>
        <Store size={iconsSize}/>
    </button>
    <button id="fleet" title="fleet" on:click={createFleetList}>
        <Plane size={iconsSize}/>
    </button>
    <button id="routes" title="routes" on:click={createRoutesList}>
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
