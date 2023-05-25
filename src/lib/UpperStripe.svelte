<script lang="ts">
    import { UserAvatarFilled } from "carbon-icons-svelte";
    import { userData as userD } from "$lib/storages/interim";

    /** Format account balance to format in which each 3 digits are separated by whitespace. Example for number: 50000 will be: 50 000 */
    function formatedAccountBalance() {
        const step1 = String($userD?.balance.toFixed(2)).split(".");
        const balanceF = step1[0].match(/\d{3}/g);
        let balanceSeparated = balanceF!.join(" ");

        return balanceSeparated += step1[1] ? "." + step1[1] : "";
    }
</script>

<div class="upper-bar">
    <button id="blank"></button> <!-- Required to create eligable place adjustment for elements -->
    <button id="account-balance" title="Account balance: {$userD ? formatedAccountBalance() : 0}$">
        <p>{$userD ? formatedAccountBalance() : 0} $</p>
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
