<script lang="ts">
    import { Money, Finance } from "carbon-icons-svelte";
    import CloseButton from "$lib/CustomElements/CloseButton.svelte";
    import commonCSS from "$lib/../routes/common.css";

    let selectedBankOption: "credit" | undefined;
</script>

{#if !selectedBankOption}
    <div class="bank-component">
        <CloseButton on:close/>
        <div class="main">
            <h1>
                <Finance size={32}/>
                Welcome on Bank
            </h1>
            <div class="options">
                <h2>Avaiable Services</h2>
                <div class="services-list">
                    <button id="take-credit" on:click={() => selectedBankOption = "credit"}>
                        <Money size={24}/> 
                        <p>Credit</p>
                    </button>
                </div>
            </div>
        </div>
    </div>
{:else if selectedBankOption == "credit"}
    <!-- Here will be option when user can take credit or pay off already existing credit -->
{/if}

<style>
    .bank-component {
        padding: 15px;
    }

    .main {
        display: flex;
        flex-direction: column;
        row-gap: 10px;
    }

    .main .options .services-list {
        margin-top: 10px;
        display: flex;
        column-gap: 5px;
        overflow-x: auto;
    }

    .services-list button {
        padding: 5px;
        border: green 2px solid;
        border-radius: 4px;
        color: green;
        font-weight: 600;
        cursor: pointer;
        background-color: white;
    }
</style>
