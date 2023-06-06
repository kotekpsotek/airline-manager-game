import { test, expect } from "@playwright/test";

test("Weather Application has got correct title", async ({ page }) => {
    // Go to application page
    await page.goto("http://localhost:5173");

    // Check title content for ensure correcteness
    await expect(page).toHaveTitle("Airline Manager Game");
});

test("Check whether all 4 buttons from 'OptionStripe.svelte' module creates its gui elements", async ({ page, browser }) => {
    // Go to application page
    await page.goto("http://localhost:5173");

    // Add localStorage required key before performing further testing
    await page.evaluate(() => {
        // Add cookie to page
        localStorage.setItem("airline-manager#userdata", `{"userName":"myname","airlineName":"airline-name","headQuarterAirport":{"location":"Warsaw","country":"Poland","airport_name":"Warsaw Chopin Airport","iata":"WAW","lat":"52.1656990051","long":"20.967100143399996","geographic_region":"Europe/Warsaw"},"fleet":[{"airplane_brand":"boeing","airplane_model_name":"737-100","airplane_specification":{"max_speed":933,"cruise_speed":780,"fuel_capacity":16786,"fuel_consumption":3.016,"max_passangers":130,"max_range":2960},"plane_price":240000,"planeId":"PO-JHU"}],"balance":622853.5812799997,"routes":[{"routeId":"AI156382","routeDestinations":{"from":{"name":"WAW (Poland Warsaw Warsaw Chopin Airport) #headquarters airport","geo":{"lat":52.26850128173828,"long":20.910999298095703}},"to":{"name":"Norway (Harstad/Narvik  Evenes Harstad/Narvik Airport)","geo":{"lat":62.5625,"long":6.119699954986572}}},"hours":{"start":"17:00","end":"18:01"},"selectedAirplane":{"airplane_brand":"boeing","airplane_model_name":"737-100","airplane_specification":{"max_speed":933,"cruise_speed":780,"fuel_capacity":16786,"fuel_consumption":3.016,"max_passangers":130,"max_range":2960},"plane_price":240000,"planeId":"PO-JHU"},"distanceBetweenPointsKm":1442,"durationOfTravelMins":128,"occupiedSeats":120,"status":"waiting for in way to","pricePerSeat":100,"inWay":{"start":"2023-06-04T16:29:42.367Z","end":"2023-06-04T18:37:42.367Z"}},{"routeId":"AI681104","routeDestinations":{"from":{"name":"WAW (Poland Warsaw Warsaw Chopin Airport) #headquarters airport","geo":{"lat":52.26850128173828,"long":20.910999298095703}},"to":{"name":"LBG (France Paris Paris-Le Bourget Airport)","geo":{"lat":50.962100982666016,"long":1.954759955406189}}},"hours":{"start":"10:00","end":"12:00"},"selectedAirplane":{"airplane_brand":"boeing","airplane_model_name":"737-100","airplane_specification":{"max_speed":933,"cruise_speed":780,"fuel_capacity":16786,"fuel_consumption":3.016,"max_passangers":130,"max_range":2960},"plane_price":240000,"planeId":"PO-JHU"},"distanceBetweenPointsKm":1315,"durationOfTravelMins":120,"status":"waiting for in way to","pricePerSeat":200,"occupiedSeats":49,"inWay":{"start":"2023-06-04T16:29:53.785Z","end":"2023-06-04T18:29:53.785Z"}}],"fuel":30,"bank":{"credits":[{"amount":10000,"releaseDate":"2023-05-27T18:51:43.552Z","interestRatePerDay":2},{"amount":10000,"releaseDate":"2023-05-27T18:51:49.408Z","interestRatePerDay":2},{"amount":10000,"releaseDate":"2023-05-27T18:51:52.551Z","interestRatePerDay":2},{"amount":100000,"releaseDate":"2023-05-27T18:51:58.148Z","interestRatePerDay":1.5},{"amount":100000,"releaseDate":"2023-05-27T18:52:01.344Z","interestRatePerDay":1.5},{"amount":100000,"releaseDate":"2023-05-27T18:52:07.132Z","interestRatePerDay":1.5},{"amount":100000,"releaseDate":"2023-05-27T18:52:10.497Z","interestRatePerDay":1.5},{"amount":100000,"releaseDate":"2023-05-27T18:52:13.582Z","interestRatePerDay":1.5},{"amount":100000,"releaseDate":"2023-05-27T18:52:17.045Z","interestRatePerDay":1.5},{"amount":10000,"releaseDate":"2023-05-27T18:53:25.026Z","interestRatePerDay":2},{"amount":10000,"releaseDate":"2023-05-27T18:53:29.051Z","interestRatePerDay":2},{"amount":10000,"releaseDate":"2023-05-27T18:53:33.657Z","interestRatePerDay":2},{"amount":10000,"releaseDate":"2023-05-27T18:53:44.560Z","interestRatePerDay":2}]}}`)
    })
    
    // Wait for some time
    await page.waitForTimeout(2_000);

    // Check market
    await page.locator("#market").click()
})
