import { describe, test, assert } from "vitest";
import { Route } from "$lib/api";

describe("api tests", () => {
    test("get arrival time for route", () => {
        const hour = Route.getArrivalHour("12:35", 150);
        console.info(`Arrival hour is: ${hour.getHrMin()}`);
    })

    test("generation id for each new route", () => {
        const newId = Route.generateRouteId(8, "L");
        console.log(newId);
    })
})
