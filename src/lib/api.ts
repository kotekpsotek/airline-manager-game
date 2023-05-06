import { PUBLIC_MAP_API_KEY } from "$env/static/public";
import { Loader } from "@googlemaps/js-api-loader";
import { browser } from "$app/environment";

/** Loaded google maps api by authorization */
export const mapLoader = async function() {
    return await new Loader({
        apiKey: PUBLIC_MAP_API_KEY,
        version: "weekly"
    }).load();
};

/** List with obtained all word airports from server side. undefined is only returned durning server side call of this value */
export const airportsAllList: Promise<string[][] | undefined> = (async function() {
    if (browser) {
        const fetchD = await fetch("/", {
            method: "GET"
        });
    
        if (fetchD.status == 200) {
            const airports: { airports: string[][] } = await fetchD.json();
            return airports.airports;
        } else {
            return Promise.reject("Couldn't obtain airports list from server side")
        }
    }
})(); 
