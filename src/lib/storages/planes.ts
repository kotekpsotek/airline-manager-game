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
}
