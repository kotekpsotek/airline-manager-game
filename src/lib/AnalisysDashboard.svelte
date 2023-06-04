<script lang="ts">
    import { page } from "$app/stores";
    import { ProgressBarRound, Close } from "carbon-icons-svelte";
    import type { HistoryData } from "./storages/history";
    import Table from "$lib/CustomElements/Table.svelte";

    const history = $page.data.history;
    history.content?.balance.push({ time: new Date(), type: "route departure", amount: 11_200, balance_after: 0, balance_before: 0 });

    /** Filtered income balance datas */
    let displayFilters = false;

    // Set income data but as sorted
    type SortingIncomesModes = "all" | "from day";
    let sortedOption: SortingIncomesModes = "all"
    let incomeData: Pick<HistoryData["balance"][0], "amount" | "time">[] = [];
    filterOption("all");

    /** Filter income Data to specific suite of income datas */
    function filterOption(t: SortingIncomesModes) {
        switch(t) {
            case "all":
                incomeData = history.content!.balance
            break;

            case "from day":
                // Sort results only when history data was saved prior otherwise set 'incomeData' as empty array
                if (history.content) {
                    sortedOption = t
                    const sorted = new Map<string, { time: Date, amount: number }>();
    
                    // Obtain incomes from specific date
                    for (const { time, amount } of history.content.balance) {
                        const tSearch = new Date(time).toLocaleDateString();

                        const sVal = sorted.get(tSearch);

                        sorted.set(tSearch, sVal ? { ...sVal, amount: sVal.amount + amount } : { time, amount })
                    }

                    // Parse income from specific date from Iterator type to Array type data and push it to incomeData result
                    incomeData = [];
                    for (const entrie of sorted.entries()) {
                        incomeData.push(entrie[1])
                    }
                }
                else incomeData = [];
            break;
        }

        // Set option which was used to sort
        sortedOption = t;
    }
</script>

<div class="analisys-dashboard">
    <div class="inside">
        <h1>Analisys Dashboard</h1>
        <div>
            <button on:click={() => displayFilters = true}>Filters</button>
            <h3>Incomes:</h3>
            <div class="incomes">
                {#if history.content?.balance}
                    <Table>
                        <th>Date/Time</th>
                        <th>Amount (USD - $)</th>
                        <svelte:fragment slot="rows">
                            {#each incomeData.reverse() as { time, amount }}
                                <tr>
                                    <td>{new Date(time).toLocaleDateString()} {sortedOption == "all" ? " - " + new Date(time).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }) : ""}</td>
                                    <td>{amount}$</td>
                                </tr>
                            {/each}
                        </svelte:fragment>
                    </Table>
                {:else}
                    <div class="empty">
                        <p>No registred your account balance history!</p>
                    </div>
                {/if}
                <div class="load-more">
                    <button>
                        <ProgressBarRound/>
                        Load 7 more
                    </button>
                </div>
            </div>
        </div>
        <div>
            <h3>Fuel Consumption:</h3>
            {#if history.content?.fuel_consumption}
                <table>
                    <tr>
                        <th>Date/Time</th>
                        <th>Amount (liters)</th>
                        <th>Storage state after</th>
                    </tr>
                    {#each history.content.fuel_consumption.reverse() as { time, amount, state_after }}
                        <tr>
                            <td>{new Date(time).toLocaleDateString()} - {new Date(time).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}</td>
                            <td>{amount}l</td>
                            <td>{state_after}l</td>
                        </tr>
                    {/each}
                </table>
            {:else}
                <div class="empty">
                    <p>No registred fuel consumption history!</p>
                </div>
            {/if}
        </div>
    </div>
</div>

{#if displayFilters}
    <div class="surrounding">
        <div class="filters-options">
            <button id="close" on:click={() => displayFilters = false}>
                <Close/>
            </button>
            <button on:click={() => filterOption("all")}>Display all</button>
            <button on:click={() => filterOption("from day")}>Display harvested from day</button>
        </div>
    </div>
{/if}