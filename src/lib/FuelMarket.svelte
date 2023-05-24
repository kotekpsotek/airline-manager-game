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

    let buyFuel: boolean = false;
    
    const { price: currentFuelPrice, date: fuelPriceForDate } = fuelMarketPrices!.getCurrentPrice()

</script>


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
