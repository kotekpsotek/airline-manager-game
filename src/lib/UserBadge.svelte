<script lang="ts">
    import { Close } from "carbon-icons-svelte";
    import { createEventDispatcher } from "svelte";
    import { deleteUserData } from "$lib/api";
    import { userData } from "$lib/storages/interim";
    import { fuelMarketPrices } from "$lib/storages/fuelmarket";
    import CreateNewAirline from "$lib/CreateNewAirline.svelte";

    /** Events dispatcher */
    const dispatcher = createEventDispatcher();

    /** When user decide to close menu using click on button with cross sign on the bottom of menu */
    function closeMenu(ev: Event) {
        dispatcher("close");
    }

    /** When user click on 'Delete your airline' button to delete user airline data and all linked with it data from user browswer 'localStorage' memory space */
    function deleteUserAirline(ev: Event) {
        // Ask to confirm information whether delete user data
        const ps = prompt("Are you sure about deleting your airline? This action won't be to undo. Pass 'delete' and confirm by clicking on 'ok' button to delete your airline or click on 'cancel' button to cancel this action")

        // Delete user data
        if (ps == "delete") {
            // Delete all necessary keys from user browswer localStorage memory-space
            deleteUserData(true);
         
            // Reset and save deleted data into user browswer localStorage memory space
            $userData = null;
            userData.saveStorageIntoUserBrowswer();

            // Reset fuel market prices datas
            $fuelMarketPrices = [];

            // Induce user to create new airline after delete old
            const createNewAirlineComponent = new CreateNewAirline({
                target: document.body
            });
        }
    }
</script>

<div class="user-account-badge">
    <h4>Your account options</h4>
    <div class="options">
        <button id="delete-airline" class="critical" on:click={deleteUserAirline}>
            Delete your airline
        </button>
    </div>
    <button id="close-menu" title="Click to close menu" on:click={closeMenu}>
        <Close size={24} fill="red"/>
    </button>
</div>

<style>
    * {
        font-family: 'Roboto', sans-serif;
    }
    
    h4 {
        text-align: center;
        color: rgb(22, 115, 237);
        border-bottom: solid 1px rgb(22, 115, 237);
        padding: 5px;
    }
    
    .user-account-badge {
        position: relative;
        min-width: 250px;
        position: absolute;
        top: 0px;
        right: 0px;
        padding: 5px;
        background-color: whitesmoke;
        border: solid 1px black;
        color: black;
    }

    .options {
        height: calc(100vh - 145px - 100px);
        overflow-y: auto;
    }

    .options > button {
        width: 100%;
        padding: 5px;
        border-bottom: solid 1px transparent;
    }

    .options > button.critical {
        color: red;
    }

    .options > button:hover {
        background-color: white;
        border-bottom-color: black;
    }

    button#close-menu {
        height: 50px;
        width: 100%;
    }

    button#close-menu:hover {
        background-color: rgb(22, 115, 237);
        color: white;
    }

    @media only screen and (max-width: 1000px) {
        .user-account-badge {
            padding-left: 0px;
            padding-right: 0px;
            height: 100%;
            width: 100%;
        }

        button#close-menu {
            width: 100%;
            bottom: 10px;
        }
    }
</style>
