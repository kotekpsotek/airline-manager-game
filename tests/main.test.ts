import { describe, test, assert } from "vitest";
import { Route, calculateDate } from "$lib/api";
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

    test("Whether route can be departuring now by time", () => {
        // Check for now
        const dn = calculateDate();
        const arg = `${dn.getHours()}:${dn.getMinutes()}`;
        const canBe = assert.isTrue(Route.checkTimeForDeparture({ start: arg, end: arg }, "waiting for in way to"), "Couldn't be departured when time now is equal to departure time")
        console.log('Can be now departured when time now is equal to route departure time');

        // Check for minute less about some minutes
        const arg2 = `${dn.getHours()}:${dn.getMinutes() - 2}`;
        const canBe2 = assert.isTrue(Route.checkTimeForDeparture({ start: arg2, end: arg2 }, "waiting for in way to"), "Couldn't be departured when time now minute is smaller then departure time minute")
        console.log("Can be now departured when departure time minutes are smaller then now minutes");

        // Check for hour less about some number
        const arg3 = `${dn.getHours() - 2}:${dn.getMinutes()}`;
        const canBe3 = assert.isTrue(Route.checkTimeForDeparture({ start: arg3, end: arg3 }, "waiting for in way to"), "Couldn't be departured when time now hour is smaller then departure time hour");
        console.log("Can be departured when time now hour is greater then departure time hour")
    });
})
