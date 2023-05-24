import { writable } from "svelte/store";
import { browser } from "$app/environment";

/** Type for each fuel price */
export interface FuelPrice {
    date: Date,
    price: number
}

/** Minimum fuel price */
export const minimumFuelPrice = 11.00;
/** Maximum fuel price */
export const maximumFuelPrice = 22.00;

/** Storage witch registred fuel prices from specific dates. Is callable only from client side (not working on server side rendering = ssr) */
export const fuelMarketPrices = (function () {
    // Inside are actions only working or which must work on client side of application rendering
    if (browser) {
        const localStorageName = "airline-manager#fuel-prices";
        const store = writable<FuelPrice[]>(loadFromLocalStorage());
        
        /** Load fuel prices from window.localStorage when exists or return empty array when doesn't exists */
        function loadFromLocalStorage(): FuelPrice[] {
            const obtained = window.localStorage.getItem(localStorageName);

            if (!obtained) return [];

            return JSON.parse(obtained);
        }

        /** Save fuel prices into browswer window.localStorage memory space */
        function saveFuelPricesIntoLocalStorage() {
            store.update(vals => {
                // Parse values
                const parsedVals = JSON.stringify(vals);

                // Save values into localStorage from browswer window
                window.localStorage.setItem(localStorageName, parsedVals);

                // Return unmodified values
                return vals;
            })
        }

        /** Generate new price when that is needed e.g: when for current date hasn't been generated fuel price */
        function generateNewFuelPrice() {
            let newPrice = Math.random() * maximumFuelPrice;
            newPrice = Number(newPrice.toFixed(2));

            // When price is smaller then the minimum price assign to current price variable new generated fuel price by recall function itself
            newPrice < minimumFuelPrice ? newPrice = generateNewFuelPrice() : null; 

            // Return generated new price
            return newPrice;
        }

        // Generate fuel price and add it to fuel prices store only when for this date hasn't been generated price yet
        store.update(prices => {
            const chckCond = prices.some(price => {
                const { date } = price;
                const dateParsedOfPrice = new Date(date).toDateString();
                const dateNow = new Date().toDateString();

                return dateNow == dateParsedOfPrice;
            });

            if (!chckCond) {
                const newPriceObj = {
                    date: new Date(),
                    price: generateNewFuelPrice()
                } satisfies FuelPrice;

                prices.push(newPriceObj);
            }

            return prices;
        })

        // Perform actions when user hide page
        window.addEventListener("pagehide", () => {
            saveFuelPricesIntoLocalStorage();
        });

        // Perform actions when user refresh page and load it second time
        window.addEventListener("reset", () => {
            saveFuelPricesIntoLocalStorage();
        });

        return {
            ...store,
            generateNewFuelPrice
        }
    }
})()
