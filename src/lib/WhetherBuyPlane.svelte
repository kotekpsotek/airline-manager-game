<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let airplaneBrand: string;
    export let airplaneModelName: string;
    export let pricePerUnit: number;

    const dispatcher = createEventDispatcher();

    let selectedStep: 1 | 2 = 1;
    let planesUnitsToOrder: number = 1;
</script>

<div class="into">
    <div class="pop-up">
        {#if selectedStep == 1}
            <h2>Specify order details</h2>
            <table class="ordering-plane">
                <tr>
                    <th>Airplane Brand</th>
                    <th>Airplane Model</th>
                    <th>Airplane Price Per Unit</th>
                </tr>
                <tr>
                    <td>{airplaneBrand}</td>
                    <td>{airplaneModelName}</td>
                    <td> {new Intl.NumberFormat("us-US", { style: "currency", currency: "USD" }).format(pricePerUnit)}</td>
                </tr>
            </table>
            <div class="specify-amount">
                <p>Specify planes amount:</p>
                <input type="number" name="planes-amount" placeholder="Planes order amount" min="1" bind:value={planesUnitsToOrder}>
            </div>
            <div class="actions">
                <button id="decline" on:click={() => dispatcher("undo-action")}>
                    Delicne
                </button>
                <button id="accept" on:click={() => selectedStep++}>
                    Go to next step
                </button>
            </div>
        {:else}
            <h2>Your order details</h2>
            <table class="order-details">
                <tr>
                    <th>Airplane Brand</th>
                    <th>Airplane Model</th>
                    <th>Airplane Price Per Unit</th>
                    <th>Units</th>
                </tr>
                <tr>
                    <td>{airplaneBrand.toLocaleUpperCase()}</td>
                    <td>{airplaneModelName}</td>
                    <td>{new Intl.NumberFormat("us-US", { style: "currency", currency: "USD" }).format(pricePerUnit)}</td>
                    <td>{planesUnitsToOrder}</td>
                </tr>
            </table>
            <div class="summary">
                <h2>Summary for payment</h2>
                <div class="price">
                    <p>Price per order:</p>
                    <p>{new Intl.NumberFormat("us-US", { style: "currency", currency: "USD" }).format(pricePerUnit * planesUnitsToOrder)}</p>
                </div>
            </div>
            <div class="actions">
                <button id="decline" on:click={() => selectedStep--}>
                    Delicne
                </button>
                <button id="accept" on:click={() => dispatcher("ordered-planes", planesUnitsToOrder)}>
                    {planesUnitsToOrder == 1 ? "Order plane" : "Order planes"}
                </button>
            </div>
        {/if}
    </div>
</div>

<style>
    * {
        font-family: 'Roboto', sans-serif;
    }
    
    .into {
        position: absolute;
        top: 0px;
        right: 0px;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.8)
    }

    h2 {
        color: rgb(22, 115, 237);
    }

    td, th {
        text-align: center;
    }

    th {
        height: 30px;
        color: white;
        background-color: rgb(22, 115, 237);
        padding-left: 5px;
        padding-right: 5px;
    }
    
    td {
        height: 25px;
    }

    td:first-of-type {
        text-transform: capitalize;
    }
    
    .pop-up {
        padding: 10px;
        display: flex;
        flex-direction: column;
        row-gap: 5px;
        background-color: white;
        border: solid 1px rgb(22, 115, 237);
        border-radius: 4px;
    }

    .specify-amount {
        display: flex;
    }

    .specify-amount p {
        width: 75%;
        padding: 5px;
        border: solid 1px rgb(22, 115, 237);
        color: rgb(22, 115, 237);
        border-radius: 4px;
        border-top-right-radius: 0px;
        border-bottom-right-radius: 0px;
        text-align: center;
    }

    .specify-amount input {
        outline: none;
        color: white;
        padding-top: 5px;
        padding-bottom: 5px;
        text-align: center;
        background-color: rgb(22, 115, 237);
        border: solid 1px rgb(22, 115, 237);
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
    }

    .specify-amount input:placeholder {
        color: white !important;
    }

    .actions {
        margin-top: 5px;
        display: flex;
        justify-content: flex-end;
        column-gap: 5px;
    }

    .actions button {
        font-size: 15px;
        padding: 2px;
        outline: none;
        border-color: transparent;
        background-color: transparent;
        border-radius: 4px;
    }

    .actions button#decline {
        color: red;
        border: solid 1px red;
    }

    .actions button#accept {
        color: green;
        border: solid 1px green;
    }

    .summary {
        display: flex;
        flex-direction: column;
        row-gap: 5px;
    }

    .summary .price {
        display: flex;
        justify-content: space-between;
    }

    .summary .price p:last-of-type {
        color: rgb(226, 198, 44);
    }
</style>
