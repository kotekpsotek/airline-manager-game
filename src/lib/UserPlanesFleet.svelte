<script lang="ts">
    import { userData } from "$lib/storages/interim";
    import { Route } from "$lib/api";

    /** Return formated name whether plane is assigned to any route and when is return formated name of route between points and route id into same string */
    function getAssignationRouteNameForGUI(planeId: string): string {
        const routeWhetherIs = Route.planeIsAssignedToRoute(planeId, $userData!.routes);
        return routeWhetherIs ? `${routeWhetherIs[1].from.name} - ${routeWhetherIs[1].to.name} (<span style="color: green;">${routeWhetherIs[0]}</span>)` : "Not assigned"
    }
</script>

<div class="planes-fleet-inside">
    <h1>Your planes fleet</h1>
    <h3>List</h3>
    <div class="planes-list">
        {#if $userData}
            <table>
                <tr>
                    <th>No.</th>
                    <th>Id</th>
                    <th>Model</th>
                    <th>Assigned to route</th>
                </tr>
                {#each $userData?.fleet as fleet_unit, it_id}
                    <tr>
                        <td class="no">{it_id + 1}</td>
                        <td style:color="green">{fleet_unit.planeId}</td>
                        <td>{fleet_unit.airplane_brand} {fleet_unit.airplane_model_name}</td>
                        <td>{@html getAssignationRouteNameForGUI(fleet_unit.planeId)}</td>
                    </tr>
                {/each}
            </table>
        {/if}
    </div>
</div>

<style>
    .planes-fleet-inside {
        padding: 10px;
        display: flex;
        flex-direction: column;
        row-gap: 5px;
    }

    h1, h3 {
        color: rgb(22, 115, 237);
    }

    table :is(th, td) {
        font-size: 15px;
    }

    table th {
        min-width: 50px;
        height: 40px;
        color: white;
        background-color: rgb(19, 96, 197);
    }

    table td {
        padding: 5px;
        height: 30px;
        text-align: center;
    }

    table td.no {
        font-weight: 600;
    }
</style>
