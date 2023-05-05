<script lang="ts">
    import { UserAvatarFilled } from "carbon-icons-svelte";
    import { userData as userD } from "$lib/storages/interim";
</script>

<div class="upper-bar">
    <button id="blank"></button> <!-- Required to create eligable place adjustment for elements -->
    <button id="account-balance" title="Account balance: 300 000$">
        <p>{$userD?.balance || 0} $</p>
    </button>
    <button id="account" title="Your Account">
        <UserAvatarFilled size={32}/>
    </button>
</div>

<style>
    button {
        max-width: calc(100% / 3);
        font-size: 25px;
        font-family: 'Roboto', sans-serif;
        color: white;
        outline: none;
        border: none;
        background-color: transparent;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }

    button#account-balance p {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    button#blank {
        width: 75px;
    }

    button#account-balance {
        width: calc(100% - 75px * 2);
    }

    button#account {
        width: 75px;
        height: 100%;
    }

    button#account:hover {
        background-color: var(--color-hover);
    }
    
    .upper-bar {
        width: 100%;
        height: 50px;
        position: absolute;
        top: 0px;
        right: 0px;
        background-color: var(--color);
        display: flex;
        justify-content: space-between;
    }
</style>
