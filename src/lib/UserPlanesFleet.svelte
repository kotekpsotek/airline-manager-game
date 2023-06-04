<script lang="ts">
    import { userData } from "$lib/storages/interim";
    import { Route } from "$lib/api";
    import { GasStationFilled } from "carbon-icons-svelte";
    import FuelMarket from "$lib/FuelMarket.svelte";
    import Table from "./CustomElements/Table.svelte";

    // To not obtaining error about inaccurate size for carbon-design-system icon
    const userFuelStatusIconSize = 28 as 32;

    /** Return formated name whether plane is assigned to any route and when is return formated name of route between points and route id into same string */
    function getAssignationRouteNameForGUI(planeId: string): string {
        const routeWhetherIs = Route.planeIsAssignedToRoute(planeId, $userData!.routes);
        return routeWhetherIs ? `${routeWhetherIs[1].from.name} - ${routeWhetherIs[1].to.name} (<span style="color: green;">${routeWhetherIs[0]}</span>)` : "Not assigned"
    }

    /** Add fuel market to user view after register click on 'Fuel market' button */
    function fuelMarket(ev: Event) {
        const fuelMarket = new FuelMarket({
            target: document.getElementsByClassName("map")[0]
        });

        /** When user click on close fuel market then handle closing fuel market procedure */
        fuelMarket.$on("close-fuel-market", () => fuelMarket.$destroy())
    }
</script>

<div class="planes-fleet-inside">
    <button class="fuel-market" on:click={fuelMarket}>
        <GasStationFilled size={24}/>
        <p>Fuel market</p>
    </button>
    <div class="fuel-station">
        <h2>Fuel station</h2>
        <div class="fuel-status">
            {#if $userData?.fuel}
                <!--  -->
                <div class="fuel">
                    <img src="src/lib/assets/icons/fuel-tank-svgrepo-com.svg" alt="" style="width: 95px; height: 95px; filter: invert(20%) sepia(93%) saturate(6501%) hue-rotate(113deg) brightness(102%) contrast(103%);">
                    <div class="fuel-status" title="Your fuel tank has got: {$userData.fuel}l of air fuel">
                        <GasStationFilled size={userFuelStatusIconSize} fill="green"/>
                        <p>{$userData.fuel.toFixed(2)}l</p>
                    </div>
                </div>
            {:else}
                <div class="lacking-with-fuel">
                    <p>Your fuel storages are empty</p>
                </div>
            {/if}
        </div>
    </div>
    <div class="planes-fleet">
        <h1>Your planes fleet</h1>
        <h3>List</h3>
        <div class="planes-list">
            {#if $userData}
                <Table>
                    <th>No.</th>
                    <th>Id</th>
                    <th>Model</th>
                    <th>Assigned to route</th>
                    <svelte:fragment slot="rows">
                        {#each $userData?.fleet as fleet_unit, it_id}
                            <tr>
                                <td class="no">{it_id + 1}</td>
                                <td style:color="green">{fleet_unit.planeId}</td>
                                <td>{fleet_unit.airplane_brand} {fleet_unit.airplane_model_name}</td>
                                <td>{@html getAssignationRouteNameForGUI(fleet_unit.planeId)}</td>
                            </tr>
                        {/each}
                    </svelte:fragment>
                </Table>
            {/if}
        </div>
    </div>
</div>

<style>
    .planes-fleet-inside {
        padding: 10px;
        display: flex;
        flex-direction: column;
        row-gap: 5px;
        position: relative;
    }

    button.fuel-market {
        padding: 5px;
        position: absolute;
        top: 10px;
        right: 10px;
        display: flex;
        column-gap: 4px;
        align-items: center;
        border: solid 2px green;
        border-radius: 4px;
        outline: none;
        color: green;
        font-family: 'Roboto', sans-serif;
        cursor: pointer;
    }

    div.fuel-station {
        display: flex;
        flex-direction: column;
        row-gap: 5px;
    }

    div.fuel-station h2 {
        color: green;
    }

    div.fuel-station div.fuel-status {
        display: flex;
        justify-content: center;
    }

    div.fuel-status .fuel .fuel-status {
        margin-top: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        column-gap: 5px;
        color: green;
    }

    div.fuel-status .lacking-with-fuel {
        width: 100%;
        height: 100px;
        color: red;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    h1, h3 {
        color: rgb(22, 115, 237);
    }
</style>
