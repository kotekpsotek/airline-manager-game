<script lang="ts">
    import { PUBLIC_MAP_ID } from "$env/static/public";
    import { Route, mapLoader, NotificationSender } from "$lib/api";
    import { userData, type Route as RouteType } from "$lib/storages/interim";
    import { PlanePrivate, Arrival, Departure, Identification, Time, Edit, EventsAlt, FlowData, CalendarAdd, GasStation, Currency } from "carbon-icons-svelte";
    import EditRoute from "$lib/submissions/EditRoute.svelte";
    import CreateRoute from "$lib/CreateRoute.svelte";
    import { PlanesList } from "./storages/planes";
    import ProgressBar from "$lib/CustomElements/ProgressBar.svelte";
    import { fuelMarketPrices } from "$lib/storages/fuelmarket";
    import { page } from "$app/stores";

    const history = $page.data.history;
    const iconsColor = "green";
    let durningCreationOfNewRoute: boolean = false;
    let durningEditionOfExistingRoute: boolean = false;

    /** Perform tasks included into function body for each route element when it is spawning into screen view */
    const whenRouteSpawned = (node: HTMLElement, iterationOverRoutesId: number) => {
        const iteratedRouteObj = $userData!.routes[iterationOverRoutesId];
        
        if (!iteratedRouteObj.occupiedSeats) {
            $userData!.routes[iterationOverRoutesId].occupiedSeats = Route.generateOccupiedPlaneSeatsCount(iteratedRouteObj.selectedAirplane)
        }

        /** Stores result of call setInterval function from inside 'when' functions sort and all enrolled with it required functionalities */
        let functionalInterval: { interval: NodeJS.Timer | undefined, clearInterval: () => void } = {
            /** Representing undefined value or setInterval function call result */
            interval: undefined,
            /** Clear this.interval when it exists (isn't equal to undefined) */
            clearInterval() {
                if (this.interval) clearInterval(this.interval);
            }
        };
        /** Called each time when route should be or is way to destination point */
        const whenInWay = () => {
            /** Function to assign percentage determining how much percentage of route last from it departure time */
            const assignPercentage = () => {
                // Obtain this element 'whenRouteSpawned' function 'node' param childrens elements for percentage indication
                const percentageRouteFinalized = node.querySelector("#percentage-route-finalized");
                const flyInProgressIndicator = (node.querySelector(".progress-bar") as HTMLProgressElement)
    
                // Calculate how much percent of route last from it departure time
                const routePercentageFinalizedCalculated = Route.howMuchPercentageFromRouteDeparture(iteratedRouteObj).toFixed(1);

                // When percentage achives some point
                if (routePercentageFinalizedCalculated.includes("100")) {
                    // When percentage to route finalization is 100% assign status 'waiting in way ..' to appropriate backward destination point
                    const dApWaitingForStatus: RouteType["status"] = Route.determineNewStatusFromInWayToWaitingFor($userData!.routes[iterationOverRoutesId]); // determine appropriate waiting status using actual 'in way ..' status
                    $userData!.routes[iterationOverRoutesId].status = dApWaitingForStatus; // assign determined 'waiting for in way ..' to destination point status

                    // Send notification that route was finalized
                    new NotificationSender().whenRouteWasFinalized(iteratedRouteObj);

                    // Recalculate amount of occupied seats for next departure
                    $userData!.routes[iterationOverRoutesId].occupiedSeats = Route.generateOccupiedPlaneSeatsCount(iteratedRouteObj.selectedAirplane);

                    // When functional interval exists then clear it
                    functionalInterval.clearInterval();
                } else {
                    // When percentage status of route finalization is smaller then 100% assign calculated route last percentage indicator to element children nodes
                    percentageRouteFinalized!.textContent = routePercentageFinalizedCalculated.includes(String(100)) ? "100" : routePercentageFinalizedCalculated;
                    flyInProgressIndicator.setAttribute("data-value", routePercentageFinalizedCalculated);
                }
            }
            assignPercentage();
    
            // Assign new percentage updated values for each 1 minute span to element children nodes
            functionalInterval.interval = setInterval(assignPercentage, 60_000)
        }
        /** Called each time when route waits for departure date to be departured */
        const whenWaiting = () => {
            functionalInterval.interval = setInterval(() => {
                // When route can be now departured
                if (Route.checkTimeForDeparture(iteratedRouteObj.hours, iteratedRouteObj.status)) {
                    // $userData!.routes[iterationOverRoutesId].status = ($userData!.routes[iterationOverRoutesId].status == "waiting for in way from") ? "in way from" : "in way to" // FIXME: afford to use that after when on application exist option instant departure without user ingerention
                    node.querySelector("button#departure-fly")?.classList.remove("departure-fly-disabled"); // allow user to departure fly manually by click on button which isn't from this step disabled
                    
                    // When functional interval exists then clear it
                    functionalInterval.clearInterval();
                }
            }, 1_000);
        }

        // Checking loop
        const chCkFn = () => {
            if (iteratedRouteObj.status.startsWith("in way")) {
                // When route should be or is in way to responsible destination route point
                whenInWay();
            } else {
                // Check whether route can be now departured
                whenWaiting();
            }
        }
        chCkFn(); // Function to check initial call
        setInterval(chCkFn, 10_000); // for every 10 seconds check will be performing

        return {}
    }

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
            durningEditionOfExistingRoute = true;

            const editElement = new EditRoute({
                target: document.getElementsByClassName("map")[0],
                props: {
                    routeId: routeSelectedId
                }
            });

            // When user close menu
            editElement.$on("closed", () => {
                editElement.$destroy();
                durningEditionOfExistingRoute = false;
            })
        }
    }

    /** When user click on button "Create new route" then allow user to create new route and calncel this moment in any moment */
    function createNewRoute(ev: Event) {
        // Determing that user is durning creation of new route
        durningCreationOfNewRoute = true;

        // Spawn component to create new route
        const createElement = new CreateRoute({
            target: document.getElementsByClassName("map")[0],
            props: {
                withCancelationAvaiable: true
            }
        });

        // When user decided to cancel creation of new route
        createElement.$on("canceled", () => {
            // Destroy element and show user other routes when it exists
            createElement.$destroy();
            durningCreationOfNewRoute = false;
        })

        // When user just created new route then add it to user-airline routes list and display all user-airline routes list again
        createElement.$on("created-route", ({ detail: routeObj }) => {
            // Create routes field when it doesn't exists
            if (!$userData!.routes) {
                $userData!.routes = [];
            }
            
            // Add new created route to user-airline routes list
            $userData!.routes.push(routeObj);
            $userData = $userData;

            // Delete "createElement" component and display routes list again
            createElement.$destroy();
            durningCreationOfNewRoute = false;
        })
    }

    console.log(history.content);

    /** When user click on "Departure" button then departured route is marked as departured */
    function departureRoute(it_id: number) {
        const route = $userData!.routes[it_id];
        return (ev: Event) => {
            // Route can be only departured when departure date is achived (this is determined by class and can be by method from 'Route' class, althought html class is sufficient for this purpose)
            if (!(ev.currentTarget as HTMLElement).classList.contains("departure-fly-disabled")) {
                // Change status of route after when was departured
                $userData!.routes[it_id].status = (route.status == "waiting for in way to") ? "in way to" : "in way from";

                // Calculations and obtains for operation over fuel required to departure route
                const requiredFuelAmountLitters = PlanesList.calculateFuelRequirements(route.distanceBetweenPointsKm, route.selectedAirplane);
                const currentFuelPrice = fuelMarketPrices!.getCurrentPrice().price;

                // When user don't have enought fuel buy required amount of fuel to full fill it or when user has got enought then use it
                if (($userData?.fuel || 0) < requiredFuelAmountLitters) {
                    // Buy fuel when user don't have enought fuel to departure route
                    const priceForFuel = currentFuelPrice * (requiredFuelAmountLitters - ($userData!.fuel || 0));
                    const conf = confirm(`You don't have got required ${requiredFuelAmountLitters} liters of fuel? Would you like to buy it for ${priceForFuel} (${currentFuelPrice}/l)`)

                    // Only when user add permision to buy fuel, fuel can be bought
                    if (conf) {
                        // Buy fuel only when user has got enought money
                        if ($userData!.balance >= priceForFuel) {
                            // Bought fuel and remove from user account money for fuel
                            $userData!.balance -= priceForFuel; 
                        }
                        else alert("You don't have got enought money to buy fuel!")
                    }
                }
                else {
                    // Use fuel which user has got (here 'fuel' field must exists on userData storage)
                    ($userData!.fuel as number) -= requiredFuelAmountLitters;
                }
    
                // Add to user account balance income from tickets for route
                $userData!.balance += route.pricePerSeat * (route.occupiedSeats as number);

                // Add to history fuel consumption information
                history.updateHistory({
                    fuel_consumption: [...(history.content?.fuel_consumption || []), { time: new Date(), amount: requiredFuelAmountLitters, state: $userData!.fuel || 0 }]
                });
                
                // Calculate route arrive date
                const getArriveDate = () => {
                    const dn = new Date();
                    const dnMilis = dn.getTime();
                    return new Date(dnMilis + $userData!.routes[it_id].durationOfTravelMins * 60 * 1_000);
                }

                // Add to route inWay field object with fullfilled nested fields
                $userData!.routes[it_id].inWay = {
                    start: new Date(),
                    end: getArriveDate(),
                }
            }
        }
    }
</script>

{#if !durningCreationOfNewRoute && !durningEditionOfExistingRoute}
    <div class="user-routes">
        <button id="create-new-route" on:click={createNewRoute}>
            <CalendarAdd size={24}/>
            <p>Add new route</p>
        </button>
        <h1>Your routes</h1>
        <div class="routes">
            <h3>List:</h3>
            {#if $userData}
                {#if $userData.routes?.length}
                    <!-- Spawn each user airline route by iterating over user airline routes array -->
                    {#each $userData.routes as { routeId, routeDestinations, selectedAirplane, hours, durationOfTravelMins, distanceBetweenPointsKm, status, occupiedSeats, pricePerSeat }, it_id}
                        <div class="single-route" use:whenRouteSpawned={it_id}>
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
                                        <p>{selectedAirplane.airplane_brand} {selectedAirplane.airplane_model_name} (plane id: {selectedAirplane.planeId})</p>
                                    </div>
                                    <div class="passangers-count-per-plane-capacity">
                                        <EventsAlt size={24} fill={iconsColor}/>
                                        <p>{occupiedSeats || 0}/{selectedAirplane.airplane_specification.max_passangers} ({Number((occupiedSeats || 0) / (selectedAirplane.airplane_specification.max_passangers / 100)).toFixed(1)}%)</p>
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
                                        <p>
                                            <!-- Determining by appropriate text elaboration time of travel depends on route status "to" or "from" destination point -->
                                            {#if status == "in way to" || status == "waiting for in way to"}
                                                {hours.start} - {Route.getArrivalHour(hours.start, durationOfTravelMins).getHrMin()}
                                            {:else if status == "in way from" || status == "waiting for in way from"}
                                                {hours.end} - {Route.getArrivalHour(hours.end, durationOfTravelMins).getHrMin()}
                                            {/if} ({durationOfTravelMins} min)
                                        </p>
                                    </div>
                                    <div class="fuel-consumption" title="Fuel consumption per one way for this route">
                                        <GasStation size={24} fill={iconsColor}/>
                                        <p>{PlanesList.calculateFuelRequirements(distanceBetweenPointsKm, selectedAirplane).toFixed(0)} l</p>
                                    </div>
                                    <div class="income-from-route" title="Income from route (in $ (USD))">
                                        <Currency size={24} fill={iconsColor}/>
                                        <p>{pricePerSeat * (occupiedSeats || 0)}$ (1s = {pricePerSeat}$)</p>
                                    </div>
                                </div>
                            </div>
                            {#if status.startsWith("waiting")}
                                <button id="departure-fly" class:departure-fly-disabled={!Route.checkTimeForDeparture(hours, status)} on:click={departureRoute(it_id)}>Depart ({status == "waiting for in way to" ? "to destination" : "from destination"})</button>
                            {:else if status.startsWith("in way")}
                                <div class="fly-departured">
                                    <button id="fly-in-process">
                                        <p>Fly is in process (<span id="percentage-route-finalized">0</span>%)</p>
                                    </button>
                                    <ProgressBar/>
                                </div>
                            {/if}
                        </div>
                    {/each}
                {:else}
                    <div class="no-av-rou">
                        <p>You don't have any avaiable route. You can create new route using above button</p>
                    </div>
                {/if}
            {/if}
        </div>
    </div>
{/if}

<style>
    * {
        font-family: 'Roboto', sans-serif;
    }

    .user-routes {
        height: calc(100% - 20px); /* 100% of parent element height - 20px from above and bottom padding */
        padding: 10px;
        display: flex;
        flex-direction: column;
        row-gap: 5px;
        overflow: auto;
        position: relative;
    }

    .user-routes button#create-new-route {
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
    }
    
    h1, h3, h4 {
        color: rgb(22, 115, 237);
    }

    button {
        cursor: pointer;
        background-color: transparent;
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

    .single-route > button#departure-fly.departure-fly-disabled {
        opacity: 0.5;
    }

    .single-route > div.fly-departured {
        width: 100%;
        display: flex;
        flex-direction: column;
        row-gap: 1px;
    }

    .single-route > div.fly-departured button#fly-in-process {
        width: 100%;
        border: solid 1px rgb(26, 224, 255);
        border-radius: 4px;
        border-bottom-right-radius: 0px;
        border-bottom-left-radius: 0px;
        padding: 5px;
        font-family: 'Roboto', sans-serif;
        font-size: 15px;
        font-weight: 600;
        background-color: rgb(29, 192, 217);
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
</style>
