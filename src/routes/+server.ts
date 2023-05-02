import { json } from "@sveltejs/kit";
import { readFileSync } from "fs"

export function GET() {
    const airportsCSVContent = readFileSync("./assets/airports.csv", { encoding: "utf-8" });
    const temporaryParsing = function() {
        // Remove delimiter's
        const st1 = airportsCSVContent.replaceAll("\r\n", "").split("\"OurAirports\"");

        // Remove comma from each row and necessary row values
        let st2 = [];
        for (const one of st1) {
            // Prepare row by removing unnecessary characters
            const parsingResult = one.trim().replaceAll("\"", "").split(",");
            
            // Remove two necessary values
            parsingResult.splice(12, 2);
    
            // Add parsed row
            st2.push(parsingResult)
        }
     
        // Return final result
        return st2;
    };
    
    return json({ airports: temporaryParsing() }, { status: 200 });
}