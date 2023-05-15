import { describe, test, assert } from "vitest";
import { Route } from "$lib/api";
import { PlanesList } from "$lib/storages/planes";
import type { UserData } from "$lib/storages/interim";

describe("api tests", () => {
    test("get arrival time for route", () => {
        const hour = Route.getArrivalHour("12:35", 150);
        console.info(`Arrival hour is: ${hour.getHrMin()}`);
    })

    test("generation id for each new route", () => {
        const newId = Route.generateRouteId(8, "L");
        console.log(newId);
    })

    test("generation license for plane", () => {
        const planeId = PlanesList.generateRegistration({ 
            headQuarterAirport: {
                country: "Poland"
            } as any
        })

        console.log(planeId);
    });
})
