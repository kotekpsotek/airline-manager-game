<!-- Spawned when user from 'Bank' component clock on 'Credit' option button from avaiable services -->
<script lang="ts">
    import CloseButton from "$lib/CustomElements/CloseButton.svelte";
    import { userData } from "$lib/storages/interim";
</script>

<div class="outside">
    <CloseButton on:close/>
    <div class="popup-menu credit-options-menu">
        <h2>Credit options</h2>
        <!-- Spawn user credits list only when user has got any credit -->
        {#if $userData?.bank && $userData?.bank.credits}
            <div class="credits-list">
                <h3>Your credits list</h3>
                <table class="list">
                    <tr>
                        <th>No.</th>
                        <th>Amount</th>
                        <th>Release Day</th>
                        <th>Interest Rate</th>
                        <th>Interest ($)</th>
                    </tr>
                    {#each $userData?.bank?.credits as { releaseDate, interestRatePerDay, amount }, i}
                        <tr>
                            <td>{i++}</td>
                            <td>{amount}$</td>
                            <td>{new Date(releaseDate).toLocaleDateString()}</td>
                            <td>{interestRatePerDay}</td>
                            <td>0$</td>
                        </tr>
                    {/each}
                </table>
            </div>
        {/if}
    </div>
</div>

<style>
    div.outside {
        width: 100%;
        height: 100%;
        position: relative;
        background-color: rgb(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    div.popup-menu {
        min-width: 350px;
        padding: 10px;
        background-color: whitesmoke;
        border: solid 1px rgb(22, 115, 237);
        border-radius: 4px;
    }
</style>
