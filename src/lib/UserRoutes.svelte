<script lang="ts">
    import { PUBLIC_MAP_ID } from "$env/static/public";
    import { Route, mapLoader } from "$lib/api";
    import { userData } from "$lib/storages/interim";
    import { PlanePrivate, Arrival, Departure, Identification, Time, Edit, EventsAlt, FlowData } from "carbon-icons-svelte";
    import EditRoute from "$lib/submissions/EditRoute.svelte";

    const iconsColor = "green";

    /** Adding map to each user-airline route */
    function addMapToSingleRoute(node: HTMLElement, param: any) {
        const fromGeo = param.from.geo;
        const toGeo = param.to.geo;

        // IIFE function to perform map addition to element
        const action = (async () => {
            await mapLoader();
            const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
            const map = new Map(node, {
                maxZoom: 15,
                minZoom: 5,
                center: { lat: fromGeo.lat, lng: fromGeo.long },
                zoom: 8,
                mapId: PUBLIC_MAP_ID
            });
    
            // Set markers to map
            const marker1 = new google.maps.Marker({
                position: {
                    lat: fromGeo.lat,
                    lng: fromGeo.long
                },
                map,
                title: "Route start point"
            });
            const market2 = new google.maps.Marker({
                position: {
                    lat: toGeo.lat,
                    lng: toGeo.long
                },
                map,
                title: "Route end point"
            });

            // Drawning polyline on map
            const line = new google.maps.Polyline({
            path: [
                { lat: fromGeo.lat, lng: fromGeo.long },
                { lat: toGeo.lat, lng: toGeo.long }
            ],
            strokeColor: "#FF0000",
            map
        })
        })();

        // Empty object must be returning from each Svelte action function
        return {}
    }

    /** 
     * **Editing route** 
     * @param iterationRouteId - must always represent existing route from svelte #each iteration
    */
    function editRoute(iterationRouteId: number) {
        const routeSelectedId = $userData!.routes[iterationRouteId].routeId;
        return (ev: Event) => {
            const editElement = new EditRoute({
                target: document.getElementsByClassName("map")[0],
                props: {
                    routeId: routeSelectedId
                }
            });

            // When user close menu
            editElement.$on("closed", () => {
                editElement.$destroy();
            })
        }
    }
</script>

<div class="user-routes">
    <h1>Your routes</h1>
    <div class="routes">
        <h3>List:</h3>
        {#if $userData}
            <!-- Spawn each user airline route by iterating over user airline routes array -->
            {#each $userData.routes as { routeId, routeDestinations, selectedAirplane, hours, durationOfTravelMins, distanceBetweenPointsKm }, it_id}
                <div class="single-route">
                    <button class="edit" title="Edit route" on:click={editRoute(it_id)}>
                        <Edit size={24} fill="red"/>
                    </button>
                    <p class="destination">{routeDestinations.from.name} - {routeDestinations.to.name}</p>
                    <div class="map" use:addMapToSingleRoute={routeDestinations}></div>
                    <div class="metadata">
                        <h4>Infos</h4>
                        <div class="src">
                            <div class="fly-identifier">
                                <Identification size={24} fill={iconsColor}/>
                                <p>{routeId}</p>
                            </div>
                            <div class="airplane">
                                <PlanePrivate size={24} fill={iconsColor}/>
                                <p>{selectedAirplane.airplane_brand} {selectedAirplane.airplane_model_name}</p>
                            </div>
                            <div class="passangers-count-per-plane-capacity">
                                <EventsAlt size={24} fill={iconsColor}/>
                                <p>22/{selectedAirplane.airplane_specification.max_passangers} (28.6%)</p>
                            </div>
                            <div class="departure-airport">
                                <Departure size={24} fill={iconsColor}/>
                                <p>{routeDestinations.from.name}</p>
                            </div>
                            <div class="arrival-airport">
                                <Arrival size={24} fill={iconsColor}/>
                                <p>{routeDestinations.to.name}</p>
                            </div>
                            <div class="distance-between-points">
                                <FlowData size={24} fill={iconsColor}/>
                                <p>{distanceBetweenPointsKm} km</p>
                            </div>
                            <div class="time-departure-arrival">
                                <Time size={24} fill={iconsColor}/>
                                <p>{hours.start} - {Route.getArrivalHour(hours.start, durationOfTravelMins).getHrMin()}</p>
                            </div>
                        </div>
                    </div>
                    <button id="departure-fly">Depart</button>
                </div>
            {/each}
        {/if}
    </div>
</div>

<style>
    * {
        font-family: 'Roboto', sans-serif;
    }

    .user-routes {
        padding: 10px;
        display: flex;
        flex-direction: column;
        row-gap: 5px;
        overflow: auto;
    }

    h1, h3, h4 {
        color: rgb(22, 115, 237);
    }

    button {
        cursor: pointer;
    }

    .routes {
        display: flex;
        flex-direction: column;
        row-gap: 3px;
    }

    div.single-route {
        width: fit-content;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        position: relative;
        background-color: rgb(179, 211, 216);
        border: solid 2px rgb(22, 115, 237);
        border-radius: 4px;
        padding: 10px;
    }

    .single-route button.edit {
        width: 35px;
        height: 35px;
        position: absolute;
        top: -1px;
        right: -5px;
        border: none;
        outline: none;
        background-color: transparent;
    }

    .single-route p.destination {
        font-weight: 600;
        text-align: center;
    }

    .single-route div.map {
        width: 100%;
        height: 75px;
        background-color: black;
    }

    .single-route div.metadata {
        width: 100%;
    }

    .single-route div.metadata > .src {
        width: 100%;
        margin-top: 3px;
        display: grid;
        grid-template-columns: auto auto;
        gap: 5px;
    }

    .single-route div.metadata > .src > div {
        color: green;
        display: flex;
        align-items: center;
        gap: 3px;
    }

    .single-route > button#departure-fly {
        width: 100%;
        border: solid 2px green;
        border-radius: 4px;
        padding: 5px;
        font-family: 'Roboto', sans-serif;
        font-size: 15px;
        font-weight: 600;
        letter-spacing: 1px;
        background-color: rgba(0, 128, 0, 0.607);
        color: white;
    }
</style>
