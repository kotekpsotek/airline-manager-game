<script lang="ts">
    import BoeingLogo from "$lib/assets/Logos_Brands/Boeing.svg";
    import AirbusLogo from "$lib/assets/Logos_Brands/Airbus_Logo.svg";
    import ATRLogo from "$lib/assets/Logos_Brands/ATR_Logo.svg";
    import { type AirplaneBrands, PlanesList, type AirplaneModel } from "$lib/storages/planes";
    import WhetherBuyPlane from "./WhetherBuyPlane.svelte";
    import { userData as userD, type UserFleetTypeUnit } from "$lib/storages/interim";

    /** Store which brand plane will be displaying to user by default */
    let choosenBrandOfPlanes: AirplaneBrands = "boeing";

    /** After when user click on specific airplane airliners brand producer user will see airplanes from this selected brand */
    function clickOnBrand(ev: Event) {
        const brandSelected = (ev.currentTarget as HTMLElement).id as AirplaneBrands;
        choosenBrandOfPlanes = brandSelected;
    }

    /** When user click on specific aircraft button user will be redirected to GUI of preparation aircraft to finalize operation by purchasing */
    function choosePlaneToBuy(airplaneBrand: AirplaneBrands, airplaneModelName: string, pricePerUnit: number, itteratedPlaneId: number) {
        return (ev: Event) => {
            const planeBoughtTask = new WhetherBuyPlane({
                target: document.getElementsByClassName("map")[0],
                props: {
                    airplaneBrand,
                    airplaneModelName,
                    pricePerUnit
                }
            });

            // When user click on "Decline" button during first pop-up window version
            planeBoughtTask.$on("undo-action", () => planeBoughtTask.$destroy());

            // When user order some number of plane units
            planeBoughtTask.$on("ordered-planes", async ({ detail: amountOfUnits }: { detail: number }) => {
                const pricePerOrder = amountOfUnits * pricePerUnit;

                // User can buy plane when have got enought money
                if ($userD?.balance && pricePerOrder <= $userD?.balance) {
                    // Remove from user balance amount of money for order
                    $userD.balance -= pricePerOrder;

                    // Add ordered planes as instant action result
                    for (let i = 0; i < amountOfUnits; i++) {
                        const airplaneModel = (await PlanesList.getAirplanes(choosenBrandOfPlanes))[itteratedPlaneId] as Partial<AirplaneModel>;
                        delete airplaneModel.airplane_image; // To adjust result object shape to requirement of "UserFleetTypeUnit" type

                        $userD.fleet.push({
                            ...(airplaneModel as UserFleetTypeUnit),
                        });
                    }
                    $userD = $userD; // must be performed in this way to add planes to user fleet

                    // Destroy pop-up to buy new plane/planes
                    planeBoughtTask.$destroy();

                    // Inform user that he bought a plane/planes
                    alert(`Congratulations you bought ${amountOfUnits} new planes!`);
                }
                else alert(`You don't have enought money on account to release order! ${$userD ? `You miss ${pricePerOrder - $userD.balance}` : ""}`.trim()); // Inform user that he haven't got enought money to release purchase
            });
        }
    }
</script>

<div class="planes-market">
    <div>
        <h1>Planes market</h1>
        <div class="choose-plane-brand">
            <button id="boeing" class:selected-brand={choosenBrandOfPlanes == "boeing"} on:click={clickOnBrand}>
                <img src="{BoeingLogo}" alt="boeing-logo">
            </button>
            <button id="airbus" class:selected-brand={choosenBrandOfPlanes == "airbus"} on:click={clickOnBrand}>
                <img src="{AirbusLogo}" alt="airbus logo"/>
            </button>
            <button id="atr" class:selected-brand={choosenBrandOfPlanes == "atr"} on:click={clickOnBrand}>
                <img src="{ATRLogo}" alt="atr logo"/>
            </button>
        </div>
        <div class="planes-list">
            <h3>Avaiable planes:</h3>
            <div class="list">
                {#key choosenBrandOfPlanes}
                    {#await PlanesList.getAirplanes(choosenBrandOfPlanes) then planes}
                        {#if planes.length}
                            {#each planes as { airplane_brand, airplane_image, airplane_model_name, airplane_specification, plane_price }, id}
                                <button class="plane" on:click={choosePlaneToBuy(airplane_brand, airplane_model_name, plane_price, id)}>
                                    <img src="/src/lib/assets/planes/{airplane_image}" alt="{airplane_model_name} image">
                                    <h4>{airplane_model_name}</h4>
                                    <table class="specification">
                                        <tr>
                                            <th>Max speed</th>
                                            <th>Cruise speed</th>
                                            <th>Fuel Capacity</th>
                                            <th>Fuel Consumption</th>
                                            <th>Max passangers</th>
                                            <th>Max range</th>
                                        </tr>
                                        <tr>
                                            <td>{airplane_specification.max_speed} km/h</td>
                                            <td>{airplane_specification.cruise_speed} km/h</td>
                                            <td>{airplane_specification.fuel_capacity} kg</td>
                                            <td>{airplane_specification.fuel_consumption} kg/km</td>
                                            <td>{airplane_specification.max_passangers} </td>
                                            <td>{airplane_specification.max_range} km</td>
                                        </tr>
                                    </table>
                                    <div class="price-per-unit">
                                        <div class="price">
                                            <p>Price per unit</p>
                                            <p class="price">{new Intl.NumberFormat("us-US", { style: "currency", currency: "USD" }).format(plane_price)}</p>
                                        </div>
                                    </div>
                                </button>
                            {/each}
                        {:else}
                            <p>No avaiable planes from selected brand!</p>
                        {/if}
                    {/await}
                {/key}
            </div>
        </div>
    </div>
</div>

<style>
    * {
        font-family: 'Roboto', sans-serif;
    }

    button {
        outline: none;
        border: none;
        background-color: transparent;
        cursor: pointer;
    }
    
    h1 {
        color: rgb(22, 115, 237);
    }

    .planes-market {
        position: absolute;
        top: 0px;
        right: 0px;
        width: 100%;
        height: 100%;
        background-color: whitesmoke;
        overflow-y: auto;
    }
    
    .planes-market > div:first-of-type {
        padding: 10px;
    }

    .choose-plane-brand {
        width: 100%;
        margin-top: 10px;
        display: flex;
        justify-content: space-between;
        column-gap: 5px;
    }

    .choose-plane-brand button {
        width: 200px;
        height: 50px;
        padding: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: solid 2px rgb(22, 115, 237);
        border-radius: 4px;
    }

    .choose-plane-brand img {
        height: 80%;
        width: 100%;
    }

    .choose-plane-brand button:not([id=boeing]) img {
        height: 50%;
    }

    .choose-plane-brand button.selected-brand {
        background-color: rgb(22, 115, 237);
    }

    div.planes-list {
        margin-top: 15px;
    }

    div.planes-list div.list {
        margin-top: 5px;
        display: flex;
        flex-direction: column;
        row-gap: 5px;
    }

    button.plane {
        display: flex;
        flex-direction: column;
        align-items: center;
        row-gap: 10px;
        width: 100%;
        padding: 5px;
        /* height: 500px; */
        border: rgb(22, 115, 237) solid 2px;
        border-radius: 4px;
        font-size: 15px;
    }

    button.plane img {
        width: 100%;
    }

    button.plane h4 {
        color: rgb(22, 115, 237);
    }

    button.plane table.specification {
        width: 100%;
    }

    button.plane table.specification th {
        height: 40px;
        color: white;
        background-color: rgb(19, 96, 197);
    }

    button.plane table.specification td {
        height: 30px;
    }

    button.plane div.price-per-unit {
        margin-top: 10px;
        width: 100%;
        display: flex;
        justify-content: flex-end;
    }

    button.plane div.price-per-unit .price {
        display: flex;
        flex-direction: column;
        row-gap: 2px;
    }

    div.price-per-unit .price p:first-of-type {
        font-size: 13px;
        font-weight: bold;
        color: rgb(179, 154, 14);
    }

    div.price-per-unit .price p.price {
        font-size: 20px;
        color: rgb(226, 198, 44);
    }
</style>
