import { writable } from "svelte/store";
import type { AirplaneModel } from "$lib/storages/planes";
import { browser } from "$app/environment";

export type UserFleetTypeUnit = Omit<AirplaneModel, "airplane_image">

/** Representing each created by user air-route from airport to airport and in other side */
export interface Route {
    routeId: string,
    routeDestinations: {
        from: {
            name: string,
            geo: { lat: number, long: number }
        },
        to: {
            name: string,
            geo: { lat: number, long: number }
        }
    },
    hours: {
        start: string,
        end: string
    },
    selectedAirplane: AirplaneModel,
    distanceBetweenPointsKm: number,
    durationOfTravelMins: number
}

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
    routes: Route[],
    /** Account balance in dolars */
    balance: number 
}
export const userData = (function() {
    const store = writable<UserData | null>(null);

    /** Save whole storage state into user browswer 'localStorage' */
    function saveStorageIntoUserBrowswer() {
        store.update(store => {
            // Save storage in browswer 'localStorage' data only when storage datas are set
            if (store) {
                const storeBackup = JSON.stringify(store);
                localStorage.setItem("airline-manager#userdata", storeBackup);
            }

            return store;
        })
    }

    /** Setup storage state from data about airline-manager saved in user browswer localStorage prior */
    function loadStorageFromUserBrowswer() {
        const browswerStorageData = localStorage.getItem("airline-manager#userdata");

        if (browswerStorageData) {
            store.update(storeData => {
                const parsedFromLocalStorage = JSON.parse(browswerStorageData);
                
                // Load data only when it isn't equal to negative value but is an object
                if (parsedFromLocalStorage) {
                    storeData = JSON.parse(browswerStorageData);
                }

                return storeData;
            })
        }
    }

    // Nested are things to perform on client side displaying not when ssr is performing
    if (browser) {
        // Save storage data into user browswer when user close page in any way
        window.addEventListener("pagehide", saveStorageIntoUserBrowswer);
    
        // Load data to storage using prior saved about airline-manager data when it exists durning showning user page
        window.addEventListener("pageshow", loadStorageFromUserBrowswer);
    }

    return {
        ...store,
        loadStorageFromUserBrowswer,
        saveStorageIntoUserBrowswer
    }
})();
