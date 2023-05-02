import { writable } from "svelte/store"

export type UserData = {
    airlineName: string,
    /** IATA code of foremost user airport */
    headQuarterAirportIATA: string,
    /** List of planes purchased by user */
    fleet: any[],
    /** List of user airline routes routes */
    routes: any[],
    /** Account balance in dolars */
    balance: number 
}
export let userData = function() {
    const store = writable<UserData | null>(null);

    return {
        ...store,
    }
}
