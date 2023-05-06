import { PUBLIC_MAP_API_KEY } from "$env/static/public";
import { Loader } from "@googlemaps/js-api-loader";

/** Loaded google maps api by authorization */
export const mapLoader = async function() {
    return await new Loader({
        apiKey: PUBLIC_MAP_API_KEY,
        version: "weekly"
    }).load();
} 
