import { writable } from "svelte/store";
import type { AirplaneModel } from "$lib/storages/planes";

export type UserFleetTypeUnit = Omit<AirplaneModel, "airplane_image">

export type UserData = {
    /** User name which don't have to be user email */
    userName: string,
    /** Airline name */
    airlineName: string,
    /** IATA code of foremost user airport */
    headQuarterAirport: {
        country: string,
        location: string,
        airport_name: string,
        iata: string,
        lat: string
        long: string,
        geographic_region: string
    },
    /** List of planes purchased by user */
    fleet: UserFleetTypeUnit[],
    /** List of user airline routes routes */
    routes: any[],
    /** Account balance in dolars */
    balance: number 
}
export const userData = (function() {
    const store = writable<UserData | null>(null);

    return {
        ...store,
    }
})();
