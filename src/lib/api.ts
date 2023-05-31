import { PUBLIC_MAP_API_KEY } from "$env/static/public";
import { Loader } from "@googlemaps/js-api-loader";
import { browser } from "$app/environment";
import { userData } from "$lib/storages/interim";
import type { UserFleetTypeUnit, Route as RouteType } from "./storages/interim";
import type { AirplaneModel } from "./storages/planes";
import type { UserData } from "$lib/storages/interim";

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

/** Calculate date now with applied timezone offset */
export const calculateDate = () => {
    const dn = new Date();
    const minsNow = dn.getTime() / 1_000 / 60;
    const minsWithOffset = dn.getTimezoneOffset() < 0 ? minsNow + (dn.getTimezoneOffset() * -1) : minsNow + dn.getTimezoneOffset();
    return new Date(minsWithOffset * 60 * 1_000)
}

/** Clear application main field element = place where all other components of application will be adding or are added */
export function clearMainAppFieldFromAnyComponents() {
    // Get application main field what mean get place where all other application components will be spawning
    const mainField = document.getElementsByClassName("map")[0];
    
    // List of childrens located into mainField
    const mC = mainField.children;

    // Itertate over childrens and remove each
    for (const children of mC) {
        children.remove();
    }
}

/** Call one time to follow all operations in background */
export function followInBackground() {
    // Follow user routes status
    setInterval(() => {
        userData.update(uData => {
            // Execute only when user datas are defined
            if (uData) {
                // Index of iteration
                let indexIterated = 0;

                // Iterate over all user routes
                for (const route of uData!.routes) {
                    const { inWay, status } = route;

                    // Measure percentage only for persisting routes
                    if (inWay && status.startsWith("in way")) {
                        const routePercentage = String(Route.howMuchPercentageFromRouteDeparture(route));

                        // When routes ends (what is determined using percentage status of persisting route (route which is in way)) send to user notification about it
                        if (routePercentage.split(".")[0].includes("100")) {
                            // Send notification that route was finalized
                            new NotificationSender().whenRouteWasFinalized(route);

                            // Determine new status of waiting for route using actual route status
                            uData.routes[indexIterated].status = Route.determineNewStatusFromInWayToWaitingFor(uData.routes[indexIterated])

                            // Recalculate amount of occupied seats for next route departure
                            uData.routes[indexIterated].occupiedSeats = Route.generateOccupiedPlaneSeatsCount(uData.routes[indexIterated].selectedAirplane);
                        }
                    }

                    // Increase index of iterated number
                    indexIterated++;
                }
            }

            return uData;
        })
    }, 10_000); // Check will be performing between 30 seconds gaps
}

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

    /** Return start and end hours for route divided and accumulated as hour and minute by object keys */
    static getHoursSeparated(hours: { start: string, end: string }): Record<"start" | "end", { hour: number, min: number }> {
        const separateFrom: (time: string) => { hour: number, min: number } = (time: string) => {
            const sep = time.split(":");
            return {
                hour: Number(sep[0]),
                min: Number(sep[1])
            }
        }
        
        return {
            start: separateFrom(hours.start),
            end: separateFrom(hours.end)
        }
    }

    /** Check whether route can be now departuring to targer airport */
    static checkTimeForDeparture(hours: { start: string, end: string }, routeStatus: RouteType["status"]) {
        // Now times
        const nD = new Date();
        const hr = nD.getHours();
        const min = nD.getMinutes();

        // Route start and end times divided by minutes and hours
        const routeTimes = Route.getHoursSeparated(hours);

        // Determine which hour of route will be checked. For determining is using route status
        let toCheck: { hour: number, min: number };
        if (routeStatus == "waiting for in way to") {
            toCheck = routeTimes.start;
        } 
        else if (routeStatus == "waiting for in way from") {
            toCheck = routeTimes.end;
        }
        else return false;

        // Check and return positive when passes
        if (toCheck.hour < hr || (toCheck.hour == hr && toCheck.min <= min)) {
            return true;
        }

        return false;
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

    /** Calculate count of occupied plane seats for each route part. Minimum count of occupied seats cannot be smaller then specified percentage (for this example this amount is: 25%) */
    static generateOccupiedPlaneSeatsCount({ airplane_specification: { max_passangers } }: AirplaneModel) {
        // Count of minimum occupied seats is set as 25%
        const minimumCountOfOccupiedSeatsByPercentage = Math.round(max_passangers / 100 * 25);

        // Calculate occupied plane seats count or set this count when is smaller then minimum as minimum count of occupied seats
        let calculate: number = Math.floor(Math.random() * max_passangers);
        if (calculate < minimumCountOfOccupiedSeatsByPercentage) {
            calculate = minimumCountOfOccupiedSeatsByPercentage;
        }

        // Return result of calculating
        return calculate;
    }

    /** Determing how much percentage last from route departure time to now using minutes and depends on RouteType[durationOfTravelMins] property */
    static howMuchPercentageFromRouteDeparture(route: RouteType) {
        const dateNw = Date.now();
        const startDateMilis = route.inWay!.start.getTime();
        const arrivalDateMilis = route.inWay!.end.getTime();
        const howMuchMinutesLastFromStartToNow = (dateNw - startDateMilis) / 1_000 / 60

        // Calculate Percentage from time whose last from route departure
        return dateNw > arrivalDateMilis ? 100 : howMuchMinutesLastFromStartToNow / (route.durationOfTravelMins / 100);
    }

    /** Determine whether plane with specified 'planeId' is assigned to any route and when is return route 'routeId' (identifier) and 'routeDestination' route destination points */
    static planeIsAssignedToRoute(planeId: UserFleetTypeUnit["planeId"], routes: UserData["routes"]) {
        let planeRoute: false | [RouteType["routeId"], RouteType["routeDestinations"]] = false;

        for (const route of routes) {
            const { routeId, routeDestinations, selectedAirplane } = route;
            const { planeId: planeIdItRoute } = selectedAirplane;

            if (planeIdItRoute == planeId) {
                planeRoute = [routeId, routeDestinations];
                break;
            }
        }

        return planeRoute;
    }

    /** This function is for determine new "waiting for .." status using for this status "in way .." from @param route 'status' field */
    static determineNewStatusFromInWayToWaitingFor(route: RouteType) {
        return route.status == "in way from" ? "waiting for in way to" : "waiting for in way from"
    }
}

/** Facilitate co-operation with notifications API */
export class NotificationSender {
    constructor() {
        // Ask user for permission to use notification
        if (Notification.permission != "granted") {
            const askPermission = () => {
                Notification.requestPermission()
                    .then(permission => {
                        if (permission != "granted") {
                            askPermission();
                        }
                    })
            };
            askPermission();
        }
    }

    /** Display notification when route was finalized */
    whenRouteWasFinalized(route: RouteType) {
        const notification = new Notification(`Route ${route.routeId} was finalized!`, {
            body: `${route.routeDestinations.from.name} - ${route.routeDestinations.to.name}`,
            icon: "/src/lib/assets/icons/route.png",
            silent: true,
        });
    }
}

/** Defines whether delete permanetely user data */
export function deleteUserData(confirm: boolean) {
    if (confirm) {
        /** To delete from localStorage key with name defined under 'key' param */
        const deleteKey = (key: string) => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
            }
        }

        // Delete user airline progress data
        deleteKey("airline-manager#userdata");

        // Delete fuel market data
        deleteKey("airline-manager#fuel-prices");
    }
}
