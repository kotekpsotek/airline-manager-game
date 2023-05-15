import { PUBLIC_MAP_API_KEY } from "$env/static/public";
import { Loader } from "@googlemaps/js-api-loader";
import { browser } from "$app/environment";
import type { UserFleetTypeUnit } from "./storages/interim";
import type { AirplaneModel } from "./storages/planes";

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

/** Class for operations over airports and it's data */
export class Airport {
    /** To call only from client side */
    static async findMatchedAirports(airportSearchByPhrase: string): Promise<string[][]> {
        // Airports list obtained from server side
        const airports = await airportsAllList as string[][];
    
        // List with matching airports
        let resultOfSearching: string[][] = [];
        
        // Check whether airports over which iteration is performing has got keyword which match to search requirement
        for (const airport of airports) {
            if (airport.includes(airportSearchByPhrase)) resultOfSearching.push(airport);
        }
    
        // Return result of searching
        return resultOfSearching;
    }

    /** Get geographic cordinates of matched airport when it has been matched. When airport doesn't matched then return Promise.reject("...reason") */
    static async getGeoParamsOfAirport(airportToObtain: string[]): Promise<{ lat: number, long: number }> {
        // Airports list obtained from server side
        const airports = await airportsAllList as string[][];

        // Found one airport data or empty array 
        let resultingAirport: string[] = [];

        // Itterate to find match
        for (const airport of airports) {
            // Check whether all words from 'airportToObrain' param matches to fields from airport
            const chck = airport.some(val => airportToObtain.includes(val));

            // When check is correct then assign value and break loop
            if (chck) {
                resultingAirport = airport;
                break;
            };
        }

        // Get geo latitude and longitude from matched airport (only when matched = not empty array)
        if (resultingAirport.length) {
            const jn = resultingAirport.join(" ");
            let [lat, long] = (jn.match(/[^,]\d{1,}\.\d{1,}/gi) as RegExpMatchArray)

            // Return result from function
            return { lat: Number(lat), long: Number(long) };
        }
        else return Promise.reject("Couldn't match an airport");
    }
}

type DistanceKm = number;
type distanceParams = { long: number, lat: number };
type RouteDurationMins = number;
/** Class for operations over routes between airports */
export class Route {
    /** Calculate distance between two airports and return this distance as a number determined in Kilometers unit. Algorithm to calulate distance between points is from webpage: https://cloud.google.com/blog/products/maps-platform/how-calculate-distances-map-maps-javascript-api */
    static calculateDistanceBetweenAirports(airportA: distanceParams, airportB: distanceParams): DistanceKm {
        const earhRadiusKm = 6378.137;

        const aLat = Number(airportA.lat);
        const bLat = Number(airportB.lat);
        const aLong = Number(airportA.long);
        const bLong = Number(airportB.long);
     
        const arlat = aLat * (Math.PI / 180); // convert degrees to radians
        const brlat = bLat * (Math.PI / 180); // conver degrees to radians
     
        const differenceRadiansLat = arlat - brlat; // radian differences in latitudes
        const differenceRadiansLong = (bLong - aLong) * (Math.PI/180); // radian differences in longitudes

        const calculationDistance = 2 * earhRadiusKm * Math.asin(Math.sqrt(Math.sin(differenceRadiansLat/2)*Math.sin(differenceRadiansLat/2)+Math.cos(arlat)*Math.cos(brlat)*Math.sin(differenceRadiansLong/2)*Math.sin(differenceRadiansLong/2))); // Calcolate distance determined in kilometers and hundreds in metters

        return Math.ceil(calculationDistance); // round always to bigger value because in aviation it isn't such important (being around 1 liter of fuel etc..)
    }

    /** Return route persisting time in minutes */
    static calculateTimeOfRoute(airplane: AirplaneModel | UserFleetTypeUnit | undefined, routeDistanceKm: number): RouteDurationMins {
        if (airplane) {
            return Math.round((routeDistanceKm / airplane.airplane_specification.max_speed) * 60 + 35);
        }
        
        return NaN;
    }

    /** Get arrival hour for route across performing calculation on route start time and it duration */
    static getArrivalHour(startHour: string, routeDurationMins: number) {
        /** Calculate number of milisecond from given amount of minutes */
        const getMillisecondsFromMinutes = (mins: number) => {
            const secs = mins * 60;
            const milis = secs * 1000;

            return milis;
        }
        
        // Processing over start route hour
        const cal = startHour.split(":");
        const start = { hour: Number(cal[0]), min: Number(cal[1]) };
        
        // Calculating number of miliseconds from each param
        const startMilis = getMillisecondsFromMinutes(start.hour * 60 + start.min);
        const durationMilis = getMillisecondsFromMinutes(routeDurationMins);

        // Calculate arrival time representing across arival miliseconds and from its amount obtain arrival hour throught 'Date' class
        const arrivalMilis = startMilis + durationMilis;
        let dt = new Date(arrivalMilis);
        dt = new Date(dt.getTime() + dt.getTimezoneOffset() * 60 * 1000);
        
        // Return calculations result object
        return { 
            hour: dt.getHours(),
            min: dt.getMinutes(),
            /** Return formatted hour with minute (like: **15:35**) from this object */
            getHrMin() {
                /** In order to swear correct hour formating for hour units smaller then '10' */
                const smallerThenTen = (number: number) => {
                    return number < 10 ? `0${number}` : number;
                };

                return `${smallerThenTen(this.hour)}:${smallerThenTen(this.min)}`;
            }
        }
    }

    /** Generate new route id for each new route. Each route should contains: 2 letter first airline name letters and tailing number code with length - number of airline letter used into identifier */
    static generateRouteId(length: 4 | 6 | 8, airlineName: string): string {
        const airlineNameSct = airlineName.trim().slice(0, 2).toLocaleUpperCase();
        let readyRoute = `${airlineNameSct}`;

        for (let i = 0; i < length - airlineNameSct.length; i++) {
            const number = Math.floor(Math.random() * 9)
            readyRoute += number;
        };

        return readyRoute;
    }
}
