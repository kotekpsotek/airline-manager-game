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
    let buyFuel: boolean = false;
    let fuelLittersOrdering: number = 1;

    // Get current prices data
    const { price: currentFuelPrice, date: fuelPriceForDate } = fuelMarketPrices!.getCurrentPrice()

    $: {
        buyFuel;

        // Spawn chart when user would like to display soure of fuel market again after displaying other menu e.g: gui element to buy fuel
        (google as any).charts.setOnLoadCallback(drawChart);
    }
</script>

{#if buyFuel}
    <!-- When user is decided to buy some fuel -->
    <div class="buy-fuel">
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
