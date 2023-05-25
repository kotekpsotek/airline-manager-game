<script lang="ts">
    import { fuelMarketPrices } from "$lib/storages/fuelmarket";

    // Load chart to html user view
    (google as any).charts.load("current", {packages:['corechart']});
    (google as any).charts.setOnLoadCallback(drawChart);
    function drawChart() {
        // Format data from fuel market storage
        const dateAndPrices: [string, number, string][] = $fuelMarketPrices!.map(({price, date}) => {
            const rgb = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`
            return [new Date(date).toDateString(), price, `color: ${rgb}`]
        });
        
        // Create table
        /// Table datas (1st one are schema for subsequent datas)
        const tableData = (google as any).visualization.arrayToDataTable([
            ["Date", "Price", { role: "style" } ],
            ...dateAndPrices,
        ]);

        /// Define chart view
        const view = new (google as any).visualization.DataView(tableData);

        /// Define options for chart element
        const options = {
            title: `Price of Fuel from last Week (${dateAndPrices[dateAndPrices.length - 8]?.[0]} - ${dateAndPrices[dateAndPrices.length - 1]?.[0]}), determined in $`,
            bar: { 
                groupWidth: `50%`
            },
            legend: {
                position: "top"
            }
        }

        // Add table to view
        /// Specify type of chart
        const chart = new (google as any).visualization.ColumnChart(document.querySelector(".fuel-chart > .main"));
        /// Draw chart to view
        chart.draw(view, options)
    }

    // Whether user is now decided to buy fuel or not
    let buyFuel: boolean = true;
    let fuelLittersOrdering: number = 1;

    // Get current prices data
    const { price: currentFuelPrice, date: fuelPriceForDate } = fuelMarketPrices!.getCurrentPrice()

    $: {
        buyFuel;

        // Spawn chart when user would like to display soure of fuel market again after displaying other menu e.g: gui element to buy fuel
        (google as any).charts.setOnLoadCallback(drawChart);
    }
</script>

<div class="fuel-market-component">
    {#if buyFuel}
        <!-- When user is decided to buy some fuel -->
        <div class="buy-fuel">
            <div class="main">
                <h2>Fuel ordering</h2>
                <div class="specs">
                    <div class="amount">
                        <input type="number" min="1" bind:value={fuelLittersOrdering}>
                        <div class="per">
                            <p>(1l = {currentFuelPrice}$)</p>
                        </div>
                    </div>
                    <div class="price-for-order">
                        <p>Price for your order:</p>
                        <p class="price">{new Intl.NumberFormat("en-EN", { style: "currency", currency: "USD" }).format(fuelLittersOrdering * currentFuelPrice)}</p>
                    </div>
                </div>
                <div class="decision">
                    <button id="decline" on:click={() => buyFuel = false}>
                        Decline
                    </button>
                    <button id="buy-fuel">
                        Buy fuel
                    </button>
                </div>
            </div>
        </div>
    {:else}
        <!-- When user is viewing fuel market -->
        {#key fuelMarketPrices}
            <div class="fuel-market">
                <h1>Fuel Market</h1>
                <div class="main">
                    <h3>Actual Fuel Price</h3>
                    <div class="price">
                        <p class="label">Current fuel price ({new Date(fuelPriceForDate).toLocaleDateString()})</p>
                        <p class="price">{currentFuelPrice}$/l</p>
                    </div>
                    <button on:click={() => buyFuel = true}>Buy</button>
                </div>
                <div class="fuel-chart">
                    <h3>Fuel prices from week</h3>
                    <!-- Element for chart with prices data -->
                    <div class="main"></div>
                </div>
            </div>
        {/key}
    {/if}
</div>

<style>
    h1, h2, h3 {
        color: rgb(22, 115, 237);
    }

    button {
        padding: 5px;
        cursor: pointer;
        color: white;
        outline: none;
        font-family: 'Roboto', sans-serif;
        font-size: 15px;
        border: none;
        border-radius: 4px;
    }

    .fuel-market-component {
        position: absolute;
        top: 0px;
        right: 0px;
        width: 100vw;
        height: 100vh;
        background-color: whitesmoke;
        overflow: auto;
    }

    /* Fuel market menu */
    .fuel-market {
        padding: 10px;
        display: flex;
        flex-direction: column;
        row-gap: 5px;
    }

    .fuel-market > .main {
        width: 100%;
    }

    .fuel-market .main > h3 {
        margin-bottom: 3px;
    }

    .fuel-market > .main > .price {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: fit-content;
        border: solid 1px rgb(22, 115, 237);
        border-radius: 4px;
        overflow: hidden;
    }

    .fuel-market > .main > .price > * {
        padding: 5px;
    }

    div.price > .label {
        width: 300px;
        color: white;
        height: 100%;
        background-color: rgb(22, 115, 237);
    }

    div.price > .price {
        width: 150px;
        text-align: center;
    }

    .fuel-market .main button {
        margin-top: 5px;
        width: 472px;
        background-color: green;
    }

    .fuel-market .fuel-chart {
        display: flex;
        flex-direction: column;
        row-gap: 3px;
    }

    .fuel-chart > .main {
        width: 100%;
        overflow: auto;
    }

    /* Buying fuel menu */
    div.buy-fuel {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.9);
    }

    div.buy-fuel .main {
        display: flex;
        flex-direction: column;
        row-gap: 5px;
        background-color: whitesmoke;
        padding: 10px;
        border: solid 1px rgb(22, 115, 237);
        border-radius: 4px;
    }

    .main > .specs .amount {
        display: flex;
    }

    .specs .amount input {
        outline: none;
        border: solid rgb(22, 115, 237) 1px;
        border-radius: 4px;
        border-right: none;
        border-top-right-radius: 0px;
        border-bottom-right-radius: 0px;
        padding: 5px;
        text-align: center;
    }

    .specs .amount div.per {
        width: 100px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: white;
        border: solid rgb(22, 115, 237) 1px;
        border-left: none;
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
        background-color: rgb(22, 115, 237);
        color: white;
    }

    .specs .price-for-order {
        margin-top: 3px;
        display: flex;
        justify-content: space-between;
    }

    .specs .price-for-order p.price {
        color: rgb(226, 198, 44);
    }

    .buy-fuel .decision {
        margin-top: 5px;
        display: flex;
        justify-content: flex-end;
        column-gap: 4px;
    }

    button#decline {
        background-color: red;
    }

    button#buy-fuel {
        background-color: green;
    }
    
    @media only screen and (max-width: 1000px) {
        div.price > .label {
            width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        div.price > .price {
            width: 100px;
        }

        .fuel-market .main button {
            width: 322px;
        }
    }
</style>
