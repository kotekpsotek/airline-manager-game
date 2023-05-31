<script lang="ts">
    import { Close } from "carbon-icons-svelte";
    import { createEventDispatcher } from "svelte";

    /** Events dispatcher */
    const dispatcher = createEventDispatcher();

    /** When user decide to close menu using click on button with cross sign on the bottom of menu */
    function closeMenu(ev: Event) {
        dispatcher("close");
    }
</script>

<div class="user-account-badge">
    <h4>Your account options</h4>
    <div class="options">
        <button id="delete-airline" class="critical">
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
