import { writable } from "svelte/store";
import type { AirplaneModel } from "$lib/storages/planes";
import { browser } from "$app/environment";

// export type UserFleetTypeUnit = Omit<AirplaneModel, "airplane_image">
export interface UserFleetTypeUnit extends Omit<AirplaneModel, "airplane_image"> {
    planeId: string
}

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
    /** Selected airplane with 'airplane_image' property and also additional 'planeId' field */
    selectedAirplane: UserFleetTypeUnit & Pick<AirplaneModel, "airplane_image">,
    distanceBetweenPointsKm: number,
    durationOfTravelMins: number,
    status: "in way to" | "in way from" | "waiting for in way to" | "waiting for in way from"
    /** How many seats are reserved by passangers */
    occupiedSeats?: number,
    /** Price per one seat in plane in $ (**USD**) unit */
    pricePerSeat: number,
    /** When user departure route and can do it this property will appear */
    inWay?: {
        start: Date,
        end: Date
    }
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
    balance: number,
    /** user fuel stores in (liters unit). When doesn't exists so = undefined this is equal in meaning that user has got 0 liters of air-fuel */
    fuel?: number
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

                // Parsing each Date property field from 'storeData' again to JavaScript Date class instance
                storeData?.routes.forEach((val, id) => {
                    if (storeData?.routes[id].inWay) {
                        storeData!.routes[id].inWay = {
                            ...storeData?.routes[id].inWay,
                            start: new Date(storeData!.routes[id].inWay!.start),
                            end: new Date(storeData!.routes[id].inWay!.end)
                        }
                    }
                })

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
