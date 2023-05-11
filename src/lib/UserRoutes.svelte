<script lang="ts">
    import { Route } from "$lib/api";
    import { userData } from "$lib/storages/interim";
    import { PlanePrivate, Arrival, Departure, Identification, Time, Edit, EventsAlt, FlowData } from "carbon-icons-svelte";
</script>

<div class="user-routes">
    <h1>Your routes</h1>
    <div class="routes">
        <h3>List:</h3>
        {#if $userData}
            <!-- Spawn each user airline route by iterating over user airline routes array -->
            {#each $userData.routes as { routeDestinations, selectedAirplane, hours, durationOfTravelMins, distanceBetweenPointsKm }}
                <div class="single-route">
                    <button class="edit">
                        <Edit size={24}/>
                    </button>
                    <p class="destination">{routeDestinations.from.name} - {routeDestinations.to.name}</p>
                    <div class="metadata">
                        <div class="fly-identifier">
                            <Identification size={24}/>
                            <p>EX001</p>
                        </div>
                        <div class="airplane">
                            <PlanePrivate size={24}/>
                            <p>{selectedAirplane.airplane_brand} {selectedAirplane.airplane_model_name}</p>
                        </div>
                        <div class="passangers-count-per-plane-capacity">
                            <EventsAlt size={24}/>
                            <p>22/{selectedAirplane.airplane_specification.max_passangers} (28.6%)</p>
                        </div>
                        <div class="departure-airport">
                            <Departure size={24}/>
                            <p>{routeDestinations.from.name}</p>
                        </div>
                        <div class="arrival-airport">
                            <Arrival size={24}/>
                            <p>{routeDestinations.to.name}</p>
                        </div>
                        <div class="distance-between-points">
                            <FlowData size={24}/>
                            <p>{distanceBetweenPointsKm} km</p>
                        </div>
                        <div class="time-departure-arrival">
                            <Time size={24}/>
                            <p>{hours.start} - {Route.getArrivalHour(hours.start, durationOfTravelMins).getHrMin()}</p>
                        </div>
                    </div>
                    <div class="departure-fly">
                        <button>Depart</button>
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</div>
