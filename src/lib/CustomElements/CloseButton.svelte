<script lang="ts">
    import { CloseFilled } from "carbon-icons-svelte";
    import { createEventDispatcher } from "svelte";
    const dispatcher = createEventDispatcher();

    function clickOnCloseButton(ev: Event) {
        dispatcher("close");
    }
</script>

<button id="close-component-button" on:click={clickOnCloseButton}>
    <CloseFilled size={24} fill="red"/>
</button>

<style>
    #close-component-button {
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: transparent;
        width: 50px;
        height: 50px;
        border: none;
        outline: none;
        cursor: pointer;
    }
</style>
