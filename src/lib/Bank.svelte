<script lang="ts">
    import { Money, Finance } from "carbon-icons-svelte";
    import CloseButton from "$lib/CustomElements/CloseButton.svelte";

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