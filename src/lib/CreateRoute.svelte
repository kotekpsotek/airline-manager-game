<script lang="ts">
    import { userData, type UserData, type UserFleetTypeUnit } from "$lib/storages/interim";
    import { PlanesList, type AirplaneModel } from "$lib/storages/planes";
    import { Airport, mapLoader, Route } from "$lib/api";
    import { PUBLIC_MAP_ID } from "$env/static/public";
    import { createEventDispatcher } from "svelte";
    import type { Route as RouteType } from "$lib/storages/interim";

    // Whether user can cancel of creating new route (really pleasant when user add new routes further time then this when user created just new airline)
    export let withCancelationAvaiable: boolean = false;
    export let edittingRoute: boolean = false;
    export let edittingRouteParams: Partial<RouteType> | undefined = undefined;
    const { selectedAirplane: baseAirplane, routeDestinations: base } = JSON.parse(JSON.stringify(edittingRouteParams || {})) as RouteType;

    /** Event dispatcher from svelte, for this component */
    const dispatcher = createEventDispatcher();
    
    let selectedPlaneModelName: string;
    let routeData = edittingRoute ? Object.assign({}, edittingRouteParams!.routeDestinations!) : {
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
    let hours = edittingRoute ? Object.assign({}, edittingRouteParams!.hours!) : {
        start: "",
        end: ""
    };
    let priceForOneRouteSeat: number = edittingRoute ? edittingRouteParams!.pricePerSeat! : 10; // Price for one seat in plane determined by user for creating route
    let selectedAirplaneData: UserFleetTypeUnit | undefined = edittingRoute ? edittingRouteParams!.selectedAirplane! : undefined; // Selected airplane details
    let distanceBetweenPointsKm: number = edittingRoute ? edittingRouteParams!.distanceBetweenPointsKm! : 0; // Distance between points in kilometers 
    let durationOfTravelMins: number = edittingRoute ? edittingRouteParams!.durationOfTravelMins! : 1; // duration of travel in minutes

    /** Store state whether user focus on inputs to determining start or end point of each route */
    let userFocusOnDestinationsInput: boolean = false;

    // Inside are data changing durning changing of route datas
    $: {
        // Obtain details about selected airplane when other airplane has been selected
        selectedPlaneModelName;
        
        // Prepare data for selected airplane only when airplane was selected
        if (selectedPlaneModelName) {
            // Separate airplane name from airplane id from fleet
            const [airplaneModel, planeUnitFromFleetId] = selectedPlaneModelName.split("#");
    
            // Get selected airplane accutate data
            const selectedAirplaneModelAcData = PlanesList.getAirplaneDetailsByModel(airplaneModel) as AirplaneModel;
    
            // Delete unnecessary proprty into type 'UserFleetTypeUnit'
            delete (selectedAirplaneModelAcData as any).airplane_image;
    
            // Assign perpared data to selected airplane field
            selectedAirplaneData = {
                ...selectedAirplaneModelAcData,
                planeId: planeUnitFromFleetId
            };
        }

        // When distance between points of travel will change
        distanceBetweenPointsKm;

        // Check whether route depature and arrival airports are different
        routeData;
        if ((routeData.from.name && routeData.to.name) && routeData.from.name.replaceAll("#headquarters airport", "").trim() == routeData.to.name) {
            alert("You pass same destination point as start point. These two points of each route must be differ to each other"); // show alert
            routeData = { from: { name: "", geo: { lat: 0, long: 0 } }, to: { name: "", geo: { lat: 0, long: 0 } } }; // resest route depature and arrival points
        }

        // Display alert when user plane hasn't got enought range to fly as far
        if ((routeData.to.name.trim() && routeData.from.name.trim()) && routeData.to.geo.lat && selectedAirplaneData && !PlanesList.whetherIsAbleToFlyThroughtDistance(distanceBetweenPointsKm, selectedAirplaneData as any)) {
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
        return !userFocusOnDestinationsInput && routeData.from && routeData.to && hours.start && hours.end && distanceBetweenPointsKm && PlanesList.whetherIsAbleToFlyThroughtDistance(distanceBetweenPointsKm, selectedAirplaneData as any) ? true : false;
    }

    /** Determine whether some from old route data was editted durning edition process. Is using when 'edittinRoute' variable is setup as 'true' boolean value */
    const routeDataEditted: () => boolean = () => {
        const p = edittingRouteParams as Partial<RouteType>;
        return p.pricePerSeat != priceForOneRouteSeat || (p.hours!.start != hours.start || p.hours!.end != hours.end) || (base.to.name != routeData.to.name || base.from.name != routeData.from.name) || baseAirplane.planeId != selectedAirplaneData!.planeId;
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
                routeId: Route.generateRouteId(8, $userData!.airlineName),
                routeDestinations: {
                    ...routeData,
                },
                hours: {
                    ...hours,
                },
                selectedAirplane: selectedAirplaneData as any,
                distanceBetweenPointsKm,
                durationOfTravelMins,
                status: "waiting for in way to",
                pricePerSeat: priceForOneRouteSeat
            } satisfies RouteType;

            // Emit event to component caller
            dispatcher("created-route", routeObj);
        }
    }

    /** Activated when user emit "click" event after click on "Edit route" button html5 element */
    function editRouteButtonClick(ev: Event) {
        // Editted Route object
        const edittedRouteObj = { // id must not be editted
            routeId: edittingRouteParams!.routeId  as RouteType["routeId"],
            routeDestinations: {
                ...routeData,
            },
            hours: {
                ...hours,
            },
            selectedAirplane: selectedAirplaneData as any,
            distanceBetweenPointsKm,
            durationOfTravelMins,
            occupiedSeats: Route.generateOccupiedPlaneSeatsCount(selectedAirplaneData as RouteType["selectedAirplane"]), // regenetate occupied seats count for each edition of route
            status: "waiting for in way to",
            pricePerSeat: priceForOneRouteSeat
        } satisfies RouteType;

        // Emit that route has been edited yet
        dispatcher("route-editted", edittedRouteObj);
    }

    /** When user decide to cancel of creation new route and confirm this step on confirm alert when option from this component 'withCancelationAvaiable' is set as true */
    function cancelCreatingNewRoute(ev: Event) {
        const ask = confirm("For sure would you like to cancel of creating new route?");

        // Only when user accept cancelation process of creating new route will be canceled in other case won't be
        if (ask) {
            dispatcher("canceled");
        }
    }

    /** When user decide to cancel of edition already existing route */
    function cancelEdittingRoute(ev: Event) {
        dispatcher("cancel-editting");
    }

    /** Check whether plane selected by user isn't reserved in other user route in selected by user hour. Correcteness is computing each time when user blur input hours fields of route after pass to it hour for some route side way */
    function checkWhetherNotReservedInHours(hours_type: Exclude<RouteType["status"], "waiting for in way from" | "waiting for in way to">) {
        
        return (ev: Event) => {
            // Id of selected by user airplane
            const selectedUserPlaneId = selectedAirplaneData?.planeId;

            // Determine whether plane is reserved by other route
            let alreadyReserved: boolean = false;

            // Calculation for selected by user hours
            const selectedByUserTime = hours_type == "in way to" ? hours.start : hours.end;
            const [selectedHour, selectedMin] = selectedByUserTime.split(":");
            const [selectedHourC, selectedMinC] = [Number(selectedHour) * 60 * 60 * 1_000, Number(selectedMin) * 60 * 1_000]
            const selectedTimeC = selectedHourC + selectedMinC;

            // Checking for selected plane within other routes
            for (const { durationOfTravelMins, hours: { start: startHour, end: endHour }, selectedAirplane: { planeId: routePlaneId } } of $userData!.routes) {
                // Perform calculations and assertions only for same airplane as selected from routes list to which plane is assigned
                if (selectedUserPlaneId == routePlaneId) {
                    const startRouteHour = hours_type == "in way to" ? startHour : endHour;
                    const [hourStart, minStart] = startRouteHour.split(":");
                    const { hour: arrivalHour, min: arrivalMin } = Route.getArrivalHour(startRouteHour, durationOfTravelMins);
    
                    // Hours calculations
                    /// Start time calculations to milliseconds
                    const hourStartC = Number(hourStart) * 60 * 60 * 1_000;
                    const minStartC = Number(minStart) * 60 * 1_000;
                    const timeStartC = hourStartC + minStartC;
                    /// End time calculations to milliseconds
                    const arrivalHourC = arrivalHour * 60 * 60 * 1_000;
                    const arrivalMinC = arrivalMin * 60 * 1_000;
                    const timeArrivalC = arrivalHourC + arrivalMinC;

                    // Determination whether selected by user time overlaps to route time
                    alreadyReserved = (selectedTimeC >= timeStartC && selectedTimeC <= timeArrivalC) || selectedTimeC == timeStartC || selectedTimeC == timeArrivalC;
                    console.log(alreadyReserved)
                }
            }

            // Clear specific hours when this is not avaiable because plane is already reserved in this hours span
            if (alreadyReserved) {
                // Display appropriate text information to user about that plane is already reserved is selected hour for other route
                alert("Selected by you plane is assigned to other route in this hour. Choose other hour or plane!");

                // Reset choosen by user hours for plane
                hours_type == "in way to" ? hours.start = "" : hours.end = "";
            }
        }
    }

    /** Get hr and minute presented in format: 'hr:min' converted to millisecond hour representation from day */
    const getHrInMilis = (hr_param: string) => {
        const [hr, min] = hr_param.split(":");
        const hrN = Number(hr);
        const minN = Number(min);

        const hrC = hrN * 60 * 60 * 1_000;
        const minC = minN * 60 * 1_000;

        const all = hrC + minC;

        return all;
    }
</script>

<svelte:body style="overflow: hidden;"/>

{#if $userData?.fleet}
    <div class="create-route">
        <div>
            <h1>{edittingRoute == false ? "Creating new Route" : `Editing route ${edittingRouteParams?.routeId || ""}`}</h1>
            <div class="select-plane">
                <h2>Choose airplane for route</h2>
                <select id="select-plane" bind:value={selectedPlaneModelName} placeholder="Select one from your planes">
                    {#each $userData.fleet as userDataFleetUnit }}
                        <!-- For user will be avaiable only planes which isn't reserved for any route -->
                        <option value="{userDataFleetUnit.airplane_model_name}#{userDataFleetUnit.planeId}">{`${userDataFleetUnit.airplane_brand} ${userDataFleetUnit.airplane_model_name}`}</option>
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
                    <div class="main">
                        <p>Determine time of start route (to destination)</p>
                        <input type="time" bind:value={hours.start} on:blur={checkWhetherNotReservedInHours("in way to")}>
                    </div>
                </div>
                <div>
                    <div class="main">
                        <p>Determine time of start route (from destination)</p>
                        <input type="time" bind:value={hours.end} on:blur={checkWhetherNotReservedInHours("in way from")}>
                    </div>
                    {#if getHrInMilis(hours.start) > getHrInMilis(hours.end)}
                        <div class="in-next-day" title="Because 'from destination' hour is smaller then 'to destination' hour your route in this direction will be departure only in next day">
                            <p>* in next day</p>
                        </div>
                    {/if}
                </div>
            </div>
            <div class="price-for-seat">
                <h2>Determine price for seats</h2>
                <div class="price-for-seat-element">
                    <div class="desc">
                        <p>Price for one seat ($ = USD)</p>
                    </div>
                    <input type="number" min="10" bind:value={priceForOneRouteSeat}>
                </div>
            </div>
            {#key selectedPlaneModelName && routeData && priceForOneRouteSeat && hours || userFocusOnDestinationsInput && priceForOneRouteSeat}
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
                                    <td>Depature date (to destination)</td>
                                    <td>{hours.start} - {Route.getArrivalHour(hours.start, durationOfTravelMins).getHrMin()}</td>
                                </tr>
                                <tr>
                                    <td>Departure date (from destination)</td>
                                    <td>
                                        {hours.end} - {Route.getArrivalHour(hours.end, durationOfTravelMins).getHrMin()}
                                        {#if getHrInMilis(hours.start) > getHrInMilis(hours.end)}
                                            <span class="in-next-day">
                                                * in next day
                                            </span>
                                        {/if}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Price for one seat</td>
                                    <td>{priceForOneRouteSeat} $</td>
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
                    {#if withCancelationAvaiable}
                        <button id="cancel" on:click={!edittingRoute ? cancelCreatingNewRoute : cancelEdittingRoute}>
                            Cancel
                        </button>
                    {/if}
                    {#if !edittingRoute}
                        <button id="create-route" disabled={!routeDetermined()} on:click={createRouteButtonClick}>
                            Create route
                        </button>
                    {:else}
                        <button id="edit-route" disabled={!routeDetermined() || !routeDataEditted()} on:click={editRouteButtonClick}>
                            Edit route
                        </button>
                    {/if}
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

    select#select-plane {
        min-width: 180px;
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
    
    .in-next-day {
        color: red !important;
    }

    div.determining-start-hours > div:nth-of-type(2) .in-next-day {
        margin-top: 2px;
    }
    
    div.determining-start-hours div.main {
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }


    div.determining-start-hours div.main p {
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

    div.determining-start-hours div.main input[type*=time] {
        border-top-left-radius: 0px;
        border-bottom-left-radius: 0px;
    }

    div.price-for-seat-element {
        display: flex;
        align-items: center;
    }

    div.price-for-seat-element .desc {
        margin-top: 5px;
        padding: 5px;
        border: solid 1px rgb(22, 115, 237);
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
        background-color: rgb(22, 115, 237);
        color: white;
    }

    div.price-for-seat-element input {
        width: 75px;
        border-top-left-radius: 0px;
        border-bottom-left-radius: 0px;
        text-align: center;
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
        margin-top: 5px;
        display: flex;
        justify-content: flex-end;
        column-gap: 5px;
    }

    div.decision button { /* Joint params for both decision buttons types */
        padding: 5px;
        outline: none;
        color: white;
        border-radius: 4px;
        font-size: 18px;
        cursor: pointer;
    }

    div.decision :is(button#create-route, button#edit-route) {
        border: solid 1px rgb(26, 186, 26);
        background-color: rgb(26, 186, 26);
    }

    div.decision button#cancel {
        border: solid 1px rgb(175, 1, 1);
        background-color: rgb(175, 1, 1);
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
