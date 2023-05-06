<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";
    import type { UserData } from "$lib/storages/interim";
    import { Search } from "carbon-icons-svelte";
    import ScrollDownButton from "$lib/CustomElements/ScrollDownButton.svelte";
    import { airportsAllList } from "$lib/api";
    
    /** New Game object: enrolls new game strategic datas */
    let newGame: Partial<UserData> = {
        userName: "",
        airlineName: "",
        headQuarterAirport: {
            location: "",
            country: "",
            airport_name: "",
            iata: "",
            lat: "",
            long: "",
            geographic_region: ""
        },
        fleet: [],
        balance: 300_000 // start amount of money assigned to new creeated game
    }

    /** Event dispatcher instance */
    const dispatcher = createEventDispatcher();
    
    /** To this variable is assigned promise which returns eligable seeking result */
    let search: Promise<string[][]> | undefined = undefined;
    let airportsList: string[][];
    let searchByValue = "";

    /** Stores button to scroll down view */
    let scrollDownButton: ScrollDownButton | undefined;

    /** Searching airport after click on search button near to field for airport searching text */
    async function searchAirport() {
        if (searchByValue.length) {
            search = new Promise((res, rej) => {
                let airportResults = [];

                // Funtion to delete button to scroll down
                const removeScrollDownButton = () => {
                    if (scrollDownButton) {
                        scrollDownButton.$destroy();
                        scrollDownButton = undefined;
                    };
                }
                
                // Itterte over airports list and add matched airports
                for (const airport of airportsList) {
                    if (airport.includes(searchByValue)) {
                        airportResults.push(airport)
                    };
                }
        
                // Return airpots
                if (airportResults.length) {
                    // Delete button to scroll down (when it exists) to prevent duplications and not eligable it usage (when overflow doesn't exists)
                    removeScrollDownButton();

                    // Return found airports list
                    res(airportResults)

                    // Setup scroll down button when overflow is caused by multiple seeked results
                    setTimeout(() => {
                        if (document.getElementsByClassName("create-new-airline")[0].scrollHeight > document.getElementsByClassName("create-new-airline")[0].clientHeight) {
                            scrollDownButton = new ScrollDownButton({
                                target: document.body,
                                props: {
                                    elementToScroll: document.getElementsByClassName("create-new-airline")[0] as HTMLElement
                                }
                            });
                        }
                    }, 1000)
                }
                else {
                    // Remove button to scroll down
                    removeScrollDownButton()

                    // Return rejection
                    rej("Couldn't seeked results!")
                }
            })
        }
        else alert("Paste text to searching airport text field")
    }

    /** Assign choosen airport to 'newGame' object */
    function assignAirport(location: string, country: string, name_airport: string, iata: string, lat: string, long: string, geo_region: string) {
        return (ev: Event) => {
            newGame.headQuarterAirport = {
                location,
                country,
                airport_name: name_airport,
                iata,
                lat,
                long,
                geographic_region: geo_region
            }
        }
    }

    /** Finalize action by acceptaition: Performing when user click on "Accept and to next step" button -> redirect after that user to next step */
    function endActionByAcceptation(ev: Event) {
        dispatcher("to-next-step", newGame);
    }

    onMount(async () => {
        airportsList = (await airportsAllList) as string[][];
    }); 

    
</script>

<div class="create-new-airline">
    <div>
        <h1>Creating new airline</h1>
        <input type="text" placeholder="User name" bind:value={newGame.userName}>
        <input type="text" placeholder="Airline name" bind:value={newGame.airlineName}>
        <div class="determine-airport">
            <div class="user-input">
                <input type="text" placeholder="Serch for your foremost airport allowed: IATA, ICAO, Name, City Name/Location Name" bind:value={searchByValue}>
                <button id="search" on:click={searchAirport}>
                    <Search size={20} fill="whitesmoke"/>
                </button>
            </div>
            <!-- When user choose airport is for user displaying what airport is actually selected -->
            {#if newGame.headQuarterAirport?.iata}
                <div class="selected-airport">
                    <p class="your-selected-airport">Airport which is selected actually by you:</p>
                    <table>
                        <tr>
                            <th>Country</th>
                            <th>City/Location</th>
                            <th>Airport Name</th>
                            <th>IATA (code)</th>
                            <th>Geographic Region</th>
                        </tr>
                        <tr>
                            <td>{newGame.headQuarterAirport.country}</td>
                            <td>{newGame.headQuarterAirport.location}</td>
                            <td>{newGame.headQuarterAirport.airport_name}</td>
                            <td>{newGame.headQuarterAirport.iata}</td>
                            <td>{newGame.headQuarterAirport.geographic_region}</td>
                        </tr>
                    </table>
                </div>
            {/if}
            <!-- Storing result of/for seek operation -->
            <div class="searching-op">
                {#if search && searchByValue.length}
                    {#await search}
                        <p class="searching">Searching in progress...</p>
                    {:then airports}
                        <table>
                            <tr>
                                <th>Country</th>
                                <th>City/Location</th>
                                <th>Airport Name</th>
                                <th>IATA (code)</th>
                                <th>ICAO (code)</th>
                                <th>Geographic Region</th>
                                <th>Action</th>
                            </tr>
                            {#each airports as [number, airport_name, location, country, IATA, ICAO, Lat, Long, code1, code2, letter, GeoRegion]}
                                <tr>
                                    <td>{country}</td>
                                    <td>{location}</td>
                                    <td>{airport_name}</td>
                                    <td>{IATA}</td>
                                    <td>{ICAO}</td>
                                    <td>{GeoRegion}</td>
                                    <td>
                                        {#if newGame.headQuarterAirport?.iata != IATA}
                                            <button on:click={assignAirport(location, country, airport_name, IATA, Lat, Long, GeoRegion)}>
                                                Choose
                                            </button>
                                        {:else}
                                        <p class="choosen">Choosen</p>
                                        {/if}
                                    </td>
                                </tr>
                            {/each}
                        </table>
                    {:catch err}
                        <p class="nf">Not found</p>
                    {/await}
                {:else}
                    <p>Click on search button to start seeking!</p>
                {/if}
            </div>
        </div>
        <div class="go-further">
            <button id="accept" on:click={endActionByAcceptation} disabled={newGame.userName && newGame.airlineName && newGame.headQuarterAirport?.iata.length ? false : true}>
               Accept and to next step
            </button>
        </div>
    </div>
</div>


<style>
    * {
        font-family: 'Roboto', sans-serif;
    }

    input {
        height: 35px;
        font-size: 16px;
        padding-left: 5px;
        padding-right: 5px;
        border: solid 2px rgb(22, 115, 237);
        outline: none;
        background-color: transparent;
        border-radius: 4px;
    }

    button {
        border: none;
        outline: none;
        background-color: transparent;
    }
    
    .create-new-airline {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0px;
        right: 0px;
        background-color: whitesmoke;
        overflow-x: auto;
    }

    .create-new-airline > div:first-of-type {
        display: flex;
        flex-direction: column;
        padding: 10px;
    }

    h1 {
        margin-bottom: 5px;
    }

    input[placeholder*='User'], input[placeholder*=Airline] {
        margin-top: 5px;
    }

    div.determine-airport {
        margin-top: 8px;
    }

    div.determine-airport div.user-input {
        width: 100%;
        display: flex;
    }

    div.user-input input {
        width: calc(100% - 50px);
        border-top-right-radius: 0px;
        border-bottom-right-radius: 0px;
        border-right: none;
    }

    div.user-input button#search {
        width: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: solid 2px rgb(22, 115, 237);
        background-color: rgb(22, 115, 237);
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
        border-left: none;
    }

    div.user-input button#search:hover {
        background-color: rgb(19, 96, 197);
    }

    div.selected-airport {
        margin-top: 5px;
    }

    div.selected-airport p.your-selected-airport {
        color: rgb(5, 117, 5);
        margin-top: 5px;
    }
    
    div.selected-airport table {
        margin-top: 4px;
        width: 100%;
    }
    
    div.selected-airport table :is(th, td) {
        height: 50px;
        text-align: center;
    }

    div.selected-airport table th {
        color: white;
        background-color: rgb(5, 117, 5);
    }

    div.determine-airport div.searching-op {
        margin-top: 5px;
        min-height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow-x: auto;
    }

    div.searching-op p.nf {
        color: red;
    }

    div.searching-op table {
        width: 100%;
    }

    div.searching-op table :is(th, td) {
        height: 50px;
        text-align: center;
    }

    div.searching-op table th {
        background-color: rgb(22, 115, 237);
        color: white;
    }

    div.searching-op table button {
        color: white;
        padding: 4px;
        background-color: green;
        border: solid 1px green;
        border-radius: 4px;
        cursor: pointer;
    }

    div.searching-op table p.choosen {
        font-size: 14px;
        color: green;
        cursor: pointer;
    }

    div.go-further {
        margin-top: 10px;
        display: flex;
        justify-content: flex-end;
    }

    div.go-further button#accept {
        padding: 8px;
        font-size: 16px;
        color: white;
        background-color: rgb(3, 167, 3);
        border: solid 1px white;
        border-radius: 4px;
        cursor: pointer;
    }

    div.go-further button#accept[disabled] {
        opacity: 0.5;
    }
</style>
