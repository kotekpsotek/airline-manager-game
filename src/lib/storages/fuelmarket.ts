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
            newPrice < minimumFuelPrice ? newPrice = Number(generateNewFuelPrice().toFixed(2)) : null; 

            // Return generated new price
            return newPrice;
        }

        /** Get current (today) price for fuel. **Warning**: When function will be call before generation new price for this date error will be returned */
        function getCurrentPrice(): FuelPrice | never {
            const dateToDay = new Date().toDateString();
            let price: FuelPrice | undefined = undefined;
            store.update(prices => {
                const tryFind = prices.find(priceObj => new Date(priceObj.date).toDateString() == dateToDay);

                if (!tryFind) throw new Error("Could not get actual price before it generation");

                price = tryFind;

                return prices
            });

            return (price as any) as FuelPrice;
        }

        // Adjust store when this is needed or perform nothign when it isn't
        store.update(prices => {
            // Do specific action regard to prices list size
            if (prices.length < 6) {
                // Fill to 6 days back when storage is smaller then 7 days
                for (let i = 6; i > 0; i--) {
                    // Determine date
                    const date = new Date();
                    date.setDate(date.getDate() - i);

                    // Add new fuel price to prices list from fuel market for determined above date
                    const fuelPriceObj: FuelPrice = {
                        date,
                        price: generateNewFuelPrice()
                    }
                    prices.push(fuelPriceObj);
                }
            }
            else if ((prices.length + 1) > 7) {
                // Delete first price because it is outdated in our order is to prsent prices from last 7 days (1 week) and no more
                prices.splice(0, prices.length - 7); 
            }
            
            // Generate fuel price and add it to fuel prices store only when for this date hasn't been generated price yet
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
            generateNewFuelPrice,
            getCurrentPrice
        }
    }
})()
