<!-- Spawned when user from 'Bank' component clock on 'Credit' option button from avaiable services -->
<script lang="ts">
    import CloseButton from "$lib/CustomElements/CloseButton.svelte";
    import { userData, type BankData } from "$lib/storages/interim";

    // Selected credit option storage
    let selectedOption: "take-credit" | undefined;
    
    // Options for credits
    const minCreditAmount = 10_000;
    const maxCreditAmount = 100_000;
    let creditAmount: number = 10000;
    let creditInterest = 2;
    
    /** Determine how much money user can take into one credit */
    function howMuchMoneyUserCanTakeIntoCredit(): number {
        return maxCreditAmount;
    }

    /** Function to calculate additional user debt for taken credit */
    function calculateAdditionalDebt(node: HTMLTableRowElement, { amount, interestRatePerDay, releaseDate }: { amount: number, interestRatePerDay: number, releaseDate: Date }) {
        const elementToInsertCalculatedDebt = node.querySelector("#debt-amount") as HTMLSpanElement;
        const howMuchMoneyIsOneDayInterest = (amount / 100) * interestRatePerDay;

        // Calculate how many days last from release date
        const dn = Date.now();
        const rl = new Date(releaseDate).getTime();
        let hw = (dn - rl) / 1_000 / 60 / 60 / 24; // calculate days amount
        hw = Math.ceil(hw); // when days amount is smaller then 1 otherwise round off number to bigger // this can be also performing in one field of constant 'hw'

        // Calculate how much money is equal to user debt
        const userDebt = howMuchMoneyIsOneDayInterest * hw;

        // Assign user debt to debt field
        elementToInsertCalculatedDebt.textContent = String(userDebt);
    }

    /** When user decide to paid off credit which user has got acquired before */
    function paidOffCredit(creditId: number) {
        return (ev: Event) => {
            // Calculate total sum to perform credit paid off operation
            const creditSize = $userData!.bank!.credits[creditId].amount;
            const additionalDebt = Number((ev.target as HTMLElement).parentElement!.parentElement!.parentElement!.querySelector("#debt-amount")!.textContent);
            const sumToPaidOff = creditSize + additionalDebt;

            // Paid off credit only when user has got enought money
            if ($userData!.balance >= sumToPaidOff) {
                const conf = confirm(`Would you like to paid of this credit with total amount ${sumToPaidOff}$?`);

                // Perform paid off credit only when user gave right for this action
                if (conf) {
                    // Remove sum off money to paid off from user account balance
                    $userData!.balance -= sumToPaidOff;

                    // Remove credit from users credits list
                    $userData!.bank!.credits.splice(creditId, 1);
                    $userData = $userData; // apply changes into svelte GUI
                }
            }
            else alert("You don't have enought money to paid off this credit!");
        }
    }

    /** When user decide to go, to new credit creation menu */
    function takeCreditMenuClick(ev: Event) {
        selectedOption = "take-credit";
    }

    /** Calculate credit interest using credit amount */
    function calculateCreditInterest(ev: Event) {
        const tg = ev.currentTarget as HTMLInputElement;
        const val = Number(tg.value);

        if (val > 50_000 && val < 500_000) {
            creditInterest = 1.5;
        }
        else if (creditInterest >= 500_000) {
            creditInterest = 0.5
        }
        else {
            creditInterest = 2.0
        }
    }

    /** When user click on button to take new credit */
    function takeCredit(ev: Event) {
        if (creditAmount >= minCreditAmount && creditAmount <= maxCreditAmount) {
            /** New credit object to save into user credits list */
            const creditObj: BankData["credits"][0] = {
                amount: creditAmount,
                releaseDate: new Date(),
                interestRatePerDay: creditInterest
            };
            
            // When user doesn't have got any bank data saved
            if (!$userData!.bank) $userData!.bank = { credits: [] };

            // Add new credit to user credits list
            $userData!.bank.credits = [...$userData!.bank.credits, creditObj];

            // Add credit moneys to user balance
            $userData!.balance += creditAmount;

            // Send to user about that user took credit
            alert("You took new credit!");

            // Close credit creation menu
            selectedOption = undefined;
        }
        else alert(`You don't fullfill requirements for credit money amount. Min credit size is: ${minCreditAmount}$ and max is: ${maxCreditAmount}$`)
    }
</script>

<div class="outside">
    {#if !selectedOption}
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
                            <th>Actions</th>
                        </tr>
                        {#each $userData?.bank?.credits as { releaseDate, interestRatePerDay, amount }, i}
                            <tr use:calculateAdditionalDebt={{ releaseDate, interestRatePerDay, amount }}>
                                <td>{i+1}</td>
                                <td>{amount}$</td>
                                <td>{new Date(releaseDate).toLocaleDateString()}</td>
                                <td>{interestRatePerDay}%</td>
                                <td><span id="debt-amount"></span>$</td>
                                <th>
                                    <button id="pay-off" on:click={paidOffCredit(i)}>
                                        Pay off
                                    </button>
                                </th>
                            </tr>
                        {/each}
                    </table>
                </div>
            {/if}
            <!-- Usable when user would like to take new credit -->
            <button class="take-credit" on:click={takeCreditMenuClick}>
                Take credit
            </button>
        </div>
    {:else if selectedOption == "take-credit"}
        <CloseButton on:close={() => selectedOption = undefined}/>
        <div class="take-new-credit-menu">
            <h2>Taking new credit</h2>
            <div class="how-mouch-money">
                <p>Determine loan amount</p>
                <input type="number" min="{minCreditAmount}" bind:value={creditAmount} max="{howMuchMoneyUserCanTakeIntoCredit()}" on:input={calculateCreditInterest}>
            </div>
            <div class="interest-rate">
                <p>Interest rate per day</p>
                <p>{creditInterest}%</p>
            </div>
            <button id="decide-to-take" on:click={takeCredit}>
                Take credit
            </button>
        </div>
    {/if}
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

    input {
        outline: none;
        border: none;
    }

    div.popup-menu, .take-new-credit-menu {
        min-width: 350px;
        padding: 10px;
        background-color: whitesmoke;
        border: solid 1px rgb(22, 115, 237);
        border-radius: 4px;
    }

    button.take-credit {
        width: 100%;
        margin-top: 5px;
        padding: 5px;
        color: white;
        background-color: cadetblue;
        border: solid black 1px;
        border-radius: 4px;
    }

    div.take-new-credit-menu {
        display: flex;
        flex-direction: column;
        row-gap: 5px;
    }

    div.take-new-credit-menu > :is(.how-mouch-money, .interest-rate) {
        display: flex;
        border: solid 1px rgb(22, 115, 237);
        border-radius: 4px;
        overflow: hidden;
    }

    div.take-new-credit-menu > :is(.how-mouch-money, .interest-rate) > p:first-of-type {
        width: 55%;
        padding: 5px;
        background-color: rgb(19, 96, 197);
        color: white;
    }

    div.take-new-credit-menu :is(.how-mouch-money, .interest-rate) > :not(p:first-of-type) {
        width: 45%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-family: 'Roboto', sans-serif;
        font-size: 15px;
    }

    button#decide-to-take {
        padding: 5px;
        background-color: rgb(15, 201, 15);
        border: solid 1px black;
        border-radius: 4px;
    }
</style>
