<script lang="ts">
    import { CloseFilled } from "carbon-icons-svelte";
    import { createEventDispatcher } from "svelte";
    import { userData, type UserData, type Route } from "$lib/storages/interim";
    import CreateRoute from "$lib/CreateRoute.svelte";
    
    export let routeId: string;
    const findRouteWithId = (JSON.parse(JSON.stringify($userData)) as UserData).routes.find((val) => {
        return (val.routeId == routeId);
    }); // JSON methods are to bypass svelte reactivity

    type Actions = "delete" | "edit" | "none";
    let action: Actions = "none";
    const evDis = createEventDispatcher();

    // To this variable is assigned value from delete action input to leater check
    let deleteActionInputValue: string = "";

    /** When user click button to close menu of route edition */
    const closeAction = () => {
        evDis("closed");
    }

    /** When user choose action which would like to perform */
    const actionInit = (type: Actions) => {
        return (ev: Event) => {
            if (type == "delete" && findRouteWithId!.status.startsWith("in way")) { // Exception for action delete route
                alert("You cannot delete route which is ongoing!");
            }
            else if (type == "edit" && findRouteWithId!.status.startsWith("in way")) { // Exception for action edit route
                alert("You cannot edit route which is ongoing!");
            }
            else action = type;
        }
    }

    /** When user choose "delete" action and click on button "Ok" which means "confirm" deltion of route in appropriate circumistances */
    const actionDelete = (ev: Event) => {
        if (deleteActionInputValue == "delete") {
            // Action of delete selected route id
            for (let i = 0; i < $userData!.routes.length; i++) {
                const { routeId: routeIdIt } = $userData!.routes[i];

                if (routeIdIt == routeId) {
                    // Delete existing route
                    $userData!.routes.splice(i, 1);
                    $userData!.routes = $userData!.routes;

                    // Close menu to modify or delete route
                    evDis("closed");
                }
            }
        }
        else alert("Deletion cannot be perform. You have to pass \"delete\" to input field correctly!");
    }

    /** When user ends editting route across change existing route data (when from spawned component is emitted event: 'route-editted') */
    function whenRouteEditted({ detail }: CustomEvent<Route>) {
        // Edit route
        let itNum = $userData!.routes.findIndex(val => {
            return (val.routeId == routeId);
        }) as number;
        $userData!.routes[itNum] = detail;

        // Close editting route menu
        action = "none"
    }
</script>

<div id="edit-span">
    <div class="enc">
        <button id="close" on:click={closeAction}>
            <CloseFilled size={24} fill="red"/>
        </button>
        {#if action == "none"}
            <div class="edit-route">
                <h2>Choose action which you'd like to perform</h2>
                <div class="buttons">
                    <button id="edit-route" on:click={actionInit("edit")}>
                        Edit
                    </button>
                    <button id="delete-route" on:click={actionInit("delete")}>
                        Delete
                    </button>
                </div>
            </div>
        {:else if action == "delete"}
            <div class="delete-action">
                <h2>Pass <span class="action-name-span">"delete"</span> and enter to delete route</h2>
                <input type="text" bind:value={deleteActionInputValue}>
                <div class="buttons">
                    <button id="ok" on:click={actionDelete}>Ok</button>
                    <button id="decline" on:click={actionInit("none")}>Decline</button>
                </div>
            </div>
        {:else if action == "edit"}
            <div class="edit-route">
                <CreateRoute withCancelationAvaiable={true} edittingRoute={true} edittingRouteParams={findRouteWithId} on:cancel-editting={() => action = "none"} on:route-editted={whenRouteEditted}/>
            </div>
        {/if}
    </div>
</div>

<style>
    #edit-span {
        position: absolute;
        top: 0px;
        right: 0px;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    #edit-span .enc {
        /* max-height: 350px; */
        position: relative;
        padding: 10px;
        background-color: whitesmoke;
        border: solid 2px rgb(22, 115, 237);
        border-radius: 4px;
        /* overflow-y: auto; */
    }

    #edit-span .enc button#close {
        width: fit-content !important;
        position: absolute;
        top: -20px;
        right: -15px;
    }

    #edit-span .enc > div {
        display: flex;
        flex-direction: column;
        row-gap: 15px;
    }

    h2 {
        color: rgb(22, 115, 237);
    }
    
    button, input {
        width: 100%;
        padding: 5px;
        font-family: 'Roboto', sans-serif;
        font-size: 15px;
        outline: none;
        border: none;
        background-color: transparent;
        cursor: pointer;
    }

    div.buttons {
        display: flex;
        flex-direction: column;
        row-gap: 5px;
    }

    button {
        border-radius: 4px;
    }

    button#edit-route {
        background-color: green;
        color: white;
    }

    button#delete-route {
        background-color: rgb(195, 3, 3);
        color: white;
    }

    /* Action to delete route */
    .delete-action input {
        width: auto;
        background-color: rgb(215, 215, 215);
        color: rgb(195, 3, 3);
        border: solid 2px rgb(195, 3, 3);
    }

    .delete-action .action-name-span {
        color: rgb(195, 3, 3);
    }

    div.buttons {
        display: flex;
        flex-direction: column;
        row-gap: 3px;
    }

    .delete-action button#ok {
        background-color: green;
        color: white;
    }

    .delete-action button#decline {
        background-color: rgb(163, 28, 28);
        color: white;
    }

    /* Action to edit route */
    .edit-route {
        max-height: 350px;
        overflow-x: hidden;
        overflow-y: auto;
    }
</style>
