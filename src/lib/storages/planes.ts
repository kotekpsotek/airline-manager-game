import type { UserData, UserFleetTypeUnit } from "$lib/storages/interim";

export type AirplaneBrands = "boeing" | "airbus" | "atr";
export interface AirplaneModel {
    airplane_brand: AirplaneBrands,
    airplane_model_name: string,
    airplane_image: string,
    airplane_specification: {
        max_speed: number,
        cruise_speed: number,
        /** Fuel Capacity: in unit l/km */
        fuel_capacity: number
        /** Fuel consumption in l/1km */
        fuel_consumption: number,
        /** Maximum passangers count */
        max_passangers: number,
        /** Range in kilometers */
        max_range: number
    },
    /** Price per each plane unit in american dolars currency */
    plane_price: number
}

/** Store informations about planes and suplies functions to obtain specific only airplanes */
export class PlanesList {
    static planesList: AirplaneModel[] = [{ airplane_brand: "boeing", airplane_model_name: "737-100", airplane_image: "boeing_737-100.jpg", airplane_specification: { max_speed: 933, cruise_speed: 780, fuel_capacity: 16_786, fuel_consumption: 3.016, max_passangers: 130, max_range: 2_960 }, plane_price: 240_000 }];

    /** Obtain specific planes using airplane brand and potentialy used filters of searching */
    static async getAirplanes(airplaneBrand: AirplaneBrands, filters?: any): Promise<AirplaneModel[]> {
        // Get only planes which has got specified brand in "airplaneBrand" param
        const getOnlySpecificBrandPlanes = PlanesList.planesList.filter(planeEntity => {
            if (planeEntity.airplane_brand == airplaneBrand) return true;
        });

        // Return value
        return getOnlySpecificBrandPlanes;
    }
    
    /** Get data about singe airplane using it model name or when passed also it airplane mother brand. Airplane data will be returning or undefined is obtaining when plane model doesn't exists */
    static getAirplaneDetailsByModel(airplaneModel: string, airplaneBrand?: AirplaneBrands): AirplaneModel | undefined {
        // Founded or not airplane model
        let result: AirplaneModel | undefined = undefined;

        // Iterate over planes database to find matching with brand and model
        for (const airplaneModelIt of PlanesList.planesList) {
            const { airplane_brand, airplane_model_name } = airplaneModelIt;
            if ((airplane_brand == airplaneBrand && airplane_model_name == airplaneModel) || airplaneModel == airplane_model_name) result = airplaneModelIt;
        }

        // Return result
        return result;
    }
    
    /** Calculate fuel rquirement in liters unit for route */
    static calculateFuelRequirements(distanceKm: number, plane: AirplaneModel | UserFleetTypeUnit): number {
        return distanceKm * plane.airplane_specification.fuel_consumption;
    }

    /** Calculate whether plane can fly to destination */
    static whetherIsAbleToFlyThroughtDistance(distanceKm: number, plane: AirplaneModel | UserFleetTypeUnit): boolean {
        // Calculate airplane requirement for fuel throught fly by distance
        const fuelRequirements = PlanesList.calculateFuelRequirements(distanceKm, plane);

        // Check whether plane can carry this much of fuel
        return fuelRequirements < plane.airplane_specification.fuel_capacity;
    }

    /** Generate and return registration for each call */
    static generateRegistration(headQuarterAirport: Pick<UserData, "headQuarterAirport">): string {
        const countryName = headQuarterAirport.headQuarterAirport.country;
        const prefixCountry = countryName.slice(0, 2);
        const lettersSet = "qwertyuiopasdfghjklzxcvbnm";

        let ready = `${prefixCountry}-`;

        for (let i = 0; i < 3; i++) {
            const randId = Math.floor(Math.random() * lettersSet.length);
            const letter = lettersSet[randId];
            ready += letter;
        }

        return ready.toLocaleUpperCase();
    }
}
