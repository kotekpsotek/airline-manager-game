<script lang="ts">
    import { userData, type UserData } from "$lib/storages/interim";
    import { PlanesList, type AirplaneModel } from "$lib/storages/planes";
    import { Airport, mapLoader, Route } from "$lib/api";
    import { PUBLIC_MAP_ID } from "$env/static/public";
    import { createEventDispatcher } from "svelte";
    import type { Route as RouteType } from "$lib/storages/interim";

    /** Event dispatcher from svelte, for this component */
    const dispatcher = createEventDispatcher();
    
    let selectedPlaneModelName: string;
    let routeData = {
        from: {
            name: "",
            geo: {
                lat: 0,
                long: 0
            }
        },
        to: {
            name: "",
            geo: {
                lat: 0,
                long: 0
            }
        },
    };
    let hours = {
        start: "",
        end: ""
    };
    let selectedAirplaneData: AirplaneModel | undefined; // Selected airplane details
    let distanceBetweenPointsKm: number = 0; // Distance between points in kilometers 
    let durationOfTravelMins: number = 1; // duration of travel in minutes

    /** Store state whether user focus on inputs to determining start or end point of each route */
    let userFocusOnDestinationsInput: boolean = false;

    // Inside are data changing durning changing of route datas
    $: {
        // Obtain details about selected airplane
        selectedPlaneModelName;
        selectedAirplaneData = PlanesList.getAirplaneDetailsByModel(selectedPlaneModelName);

        // When distance between points of travel will change
        distanceBetweenPointsKm;

        // Check whether route depature and arrival airports are different
        routeData;
        if ((routeData.from.name && routeData.to.name) && routeData.from.name.replaceAll("#headquarters airport", "").trim() == routeData.to.name) {
            alert("You pass same destination point as start point. These two points of each route must be differ to each other"); // show alert
            routeData = { from: { name: "", geo: { lat: 0, long: 0 } }, to: { name: "", geo: { lat: 0, long: 0 } } }; // resest route depature and arrival points
        }

        // Display alert when user plane hasn't got enought range to fly as far
        if ((routeData.to.name.trim() && routeData.from.name.trim()) && routeData.to.geo.lat && selectedAirplaneData && !PlanesList.whetherIsAbleToFlyThroughtDistance(distanceBetweenPointsKm, selectedAirplaneData as AirplaneModel)) {
            distanceBetweenPointsKm = 0;
            routeData.to = {
                name: "",
                geo: { lat: 0, long: 0 }
            }
            alert("Your plane hasn't got enought range to fly as far. Choose plane with heighter range or choose shorter route")
        }

        // Assign new duration of travel when one of function params will change thanks to upper values given into svelte reactive object
        durationOfTravelMins = Route.calculateTimeOfRoute(selectedAirplaneData, distanceBetweenPointsKm);
    }

    /** Check whether user pass all data required to create a new route */
    const routeDetermined: () => boolean = () => {
        return !userFocusOnDestinationsInput && routeData.from && routeData.to && hours.start && hours.end && distanceBetweenPointsKm && PlanesList.whetherIsAbleToFlyThroughtDistance(distanceBetweenPointsKm, selectedAirplaneData as AirplaneModel) ? true : false;
    }

    /** Get formated headquarters airport name for usage into GUI */
    const getHeadQuartersAirportName: () => string = () => {
        const { headQuarterAirport } = $userData as UserData;
        const { country, location, airport_name, iata } = headQuarterAirport;
        
        return `${iata} (${country} ${location} ${airport_name})`;
    }

    /** Focus input route determinig destination/start point input */
    function focusInputDestination(ev: Event) {
        // User start taking focus on this type of input
        userFocusOnDestinationsInput = true;
    }

    /** When user lost focus on one from input to pass route destination or start point */
    function blurInputDestination(inputType: "from" | "to") {
        return async (ev: Event) => {
            const { value } = (ev.currentTarget as HTMLInputElement);

            // User stop taking focus on this type of inputs
            userFocusOnDestinationsInput = false;
            
            if (value.length) {
                const repla = value.replaceAll(/[()]|#headquarters airport|\s{2,}/gi, "").trim(); // replace values assigned from GUI side durning 'for human' formating
                const spl = repla.split(" "); // split obtained values to array by separating values using whitespaces
                const { lat, long } = await Airport.getGeoParamsOfAirport(spl);
                
                // Assign cordinated to appropriate route point
                routeData[inputType].geo = { lat, long };

                // Calculate distance between two point
                distanceBetweenPointsKm = Route.calculateDistanceBetweenAirports(routeData.from.geo, routeData.to.geo);
            } else {
                routeData[inputType].geo = { lat: 0, long: 0 };

                // Assign null distance between points = 0km
                distanceBetweenPointsKm = 0;
            }
        }
    }

    /** Added map with route preview directly to Svelte application template (markers between points and polyline drawed between these points) */
    async function addPreviewOfRouteMap() {
        const loader = await mapLoader();

        const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        const map = new Map(document.getElementsByClassName("map-preview-route")[0] as HTMLElement, {
            maxZoom: 11,
            minZoom: 5,
            center: { lat: 52.237049, lng: 21.017532 },
            zoom: 8,
            mapId: PUBLIC_MAP_ID
        });

        // Set markers to map
        const marker1 = new google.maps.Marker({
            position: {
                lat: routeData.to.geo.lat,
                lng: routeData.to.geo.long
            },
            map,
            title: "Route start point"
        });
        const market2 = new google.maps.Marker({
            position: {
                lat: routeData.from.geo.lat,
                lng: routeData.from.geo.long
            },
            map,
            title: "Route end point"
        });

        // Draw polyline on map
        const line = new google.maps.Polyline({
            path: [
                { lat: routeData.from.geo.lat, lng: routeData.from.geo.long },
                { lat: routeData.to.geo.lat, lng: routeData.to.geo.long }
            ],
            strokeColor: "#FF0000",
            map
        })

        // Return empty string to GUI scarfolding
        return ""
    }

    /** Activaed when user emit "click" event after click on "Create route" button html5 element */
    function createRouteButtonClick(ev: Event) {
        // Perform action only when user pass all data required to determine route
        if (routeDetermined()) {
            // Route object
            const routeObj = {
                routeDestinations: {
                    ...routeData,
                },
                hours: {
                    ...hours,
                },
                selectedAirplane: selectedAirplaneData as AirplaneModel,
                distanceBetweenPointsKm,
                durationOfTravelMins
            } satisfies RouteType;

            // Emit event to component caller
            dispatcher("created-route", routeObj);
        }
    }
</script>

<svelte:body style="overflow: hidden;"/>

{#if $userData?.fleet}
    <div class="create-route">
        <div>
            <h1>Creating new Route</h1>
            <div class="select-plane">
                <h2>Choose airplane for route</h2>
                <select id="select-plane" bind:value={selectedPlaneModelName} placeholder="Select one from your planes">
                    {#each $userData.fleet as userDataFleetUnit }}
                        <option value="{userDataFleetUnit.airplane_model_name}">{`${userDataFleetUnit.airplane_brand} ${userDataFleetUnit.airplane_model_name}`}</option>
                    {/each}
                    <option value=""></option>
                </select>
            </div>
            <div class="determining-from-to">
                <h2>Determine route start and end point</h2>
                <input type="text" placeholder="From airport:" bind:value={routeData.from.name} on:blur="{blurInputDestination("from")}" on:focus={focusInputDestination} list="hint-user-airports">
                <datalist id="hint-user-airports">
                    <option value="{getHeadQuartersAirportName() + " #headquarters airport"}"/>
                </datalist>
                <input type="text" placeholder="Destination airport:" bind:value={routeData.to.name} on:blur="{blurInputDestination("to")}" on:focus={focusInputDestination} list="hint-arrival-airport">
                <!-- Hint with airports which matches to what user pass into field "Destination airport" -->
                {#key routeData.to}
                    {#await Airport.findMatchedAirports(routeData.to.name) then matchedAirports}
                        {#if matchedAirports.length}
                            <datalist id="hint-arrival-airport">
                                {#each matchedAirports as [number, airport_name, location, country, IATA, ICAO, Lat, Long, code1, code2, letter, GeoRegion]}
                                    <option value="{IATA} ({country} {location} {airport_name})"/>
                                {/each}
                            </datalist>
                        {/if}
                    {/await}
                {/key}
            </div>
            <div class="determining-start-hours">
                <div>
                    <p>Determine time of start route (to destination)</p>
                    <input type="time" bind:value={hours.start}>
                </div>
                <div>
                    <p>Determine time of start route (from destination)</p>
                    <input type="time" bind:value={hours.end}>
                </div>
            </div>
            {#key selectedPlaneModelName && routeData && hours || userFocusOnDestinationsInput}
                {#if routeDetermined()}
                    <div class="route-determined-details">
                        <div class="map">
                            <h2>Preview map</h2>
                            <div class="map-preview-route">{addPreviewOfRouteMap()}</div>
                        </div>
                        <div class="details">
                            <h2>Details of created route</h2>
                            <table>
                                <tr>
                                    <th>Property</th>
                                    <th>Value</th>
                                </tr>
                                <tr>
                                    <td>From</td>
                                    <td>{routeData.from.name}</td>
                                </tr>
                                <tr>
                                    <td>To</td>
                                    <td>{routeData.to.name}</td>
                                </tr>
                                <tr>
                                    <td>Distance</td>
                                    <td>{distanceBetweenPointsKm} km</td>
                                </tr>
                                <tr>
                                    <td>Selected airplane</td>
                                    <td>{`${selectedAirplaneData?.airplane_brand} ${selectedAirplaneData?.airplane_model_name}`}</td>
                                </tr>
                                <tr>
                                    <td>Route duration</td>
                                    <td>{durationOfTravelMins} minutes</td>
                                </tr>
                                <tr>
                                    <td>Depature date</td>
                                    <td>{hours.start}</td>
                                </tr>
                                <tr>
                                    <td>Arrival hour</td>
                                    <td>{hours.end}</td>
                                </tr>
                            </table>
                        </div>
                        <div class="requirements">
                            <h2>Requirements of created route</h2>
                            <table>
                                <tr>
                                    <th>Property</th>
                                    <th>Value</th>
                                </tr>
                                <tr>
                                    <td>Plane (for whole route)</td>
                                    <td>{`${selectedAirplaneData?.airplane_brand} ${selectedAirplaneData?.airplane_model_name}`}</td>
                                </tr>
                                <tr>
                                    <td>Fuel</td>
                                    <td>{selectedAirplaneData ? `${PlanesList.calculateFuelRequirements(distanceBetweenPointsKm, selectedAirplaneData)} l` : "Unknown airplane model could't get it fuel consumption!"}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                {/if}
                <div class="decision">
                    <button id="create-route" disabled={!routeDetermined()} on:click={createRouteButtonClick}>
                        Create route
                    </button>
                </div>
            {/key}
        </div>
    </div>
{/if}

<style>
    * {
        font-family: 'Roboto', sans-serif;
    }
    
    div.create-route {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        overflow-x: auto;
    }

    div.create-route > div {
        margin: 5px;
        height: fit-content;
        padding: 10px;
        display: flex;
        flex-direction: column;
        row-gap: 5px;
        border: solid 2px rgb(22, 115, 237);
        border-radius: 4px;
        overflow: auto;
    }

    h1 {
        color: rgb(22, 115, 237);
    }

    h2 {
        color: rgb(19, 96, 197);
    }

    select, input {
        color: rgb(22, 115, 237);
        border: solid 1px rgb(22, 115, 237);
        border-radius: 4px;
        padding: 5px;
        outline: none;
        background-color: transparent;
        font-size: 15px;
        margin-top: 5px;
    }

    :is(input, select)::placeholder {
        color: rgb(22, 115, 237);
    }

    div.determining-start-hours {
        display: flex;
        column-gap: 5px;
        height: fit-content;
    }

    div.determining-start-hours input {
        margin-top: 0px;
    }

    div.determining-start-hours div {
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    div.determining-start-hours div p {
        height: 100%;
        background-color: rgb(22, 115, 237);
        border: solid 2px rgb(22, 115, 237);
        border-radius: 4px;
        border-top-right-radius: 0px;
        border-bottom-right-radius: 0px;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    div.determining-start-hours div input[type*=time] {
        border-top-left-radius: 0px;
        border-bottom-left-radius: 0px;
    }

    div.route-determined-details {
        display: flex;
        flex-direction: column;
        row-gap: 5px;
    }

    div.map > div.map-preview-route {
        width: 300px;
        height: 300px;
        margin-top: 5px;
    }

    table {
        width: 100%;
    }

    table th {
        height: 30px;
        text-align: center;
        color: white;
        background-color: rgb(22, 115, 237);
    }

    table td {
        height: 25px;
        padding: 2px;
    }

    table > tr > td:first-of-type {
        color: rgb(22, 115, 237);
    }

    div.decision {
        display: flex;
        justify-content: flex-end;
    }

    div.decision button {
        padding: 5px;
        outline: none;
        color: white;
        border: solid 1px rgb(26, 186, 26);
        border-radius: 4px;
        background-color: rgb(26, 186, 26);
        font-size: 18px;
        cursor: pointer;
    }

    div.decision button[disabled] {
        opacity: 0.5;
    }

    @media only screen and (min-width: 1050px) {
        div.create-route > div {
            min-width: 1000px;
            overflow: hidden;
        }

        div.map > div.map-preview-route {
            width: 500px;
            height: 500px;
        }
    }
</style>
