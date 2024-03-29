type BalanceActType = "route departure"

/** Representing history data of airline-manager */
export interface HistoryData {
    /** Fuel consumption from user departures */
    fuel_consumption: { time: Date, amount: number, state_after: number }[],
    /** Informations about balance state */
    balance: { time: Date, type: BalanceActType, amount: number, balance_after: number, balance_before: number }[]
}

type OldHistoryData = HistoryData | null;

/** Class to co-op with history data of airline-manager */
export class History {
    content: null | HistoryData
    
    static key_name = "airline-manager-history";

    constructor() {
        this.content = this.getHistory();
    }

    /** Obtain history data from storage */
    private getHistory(): null | HistoryData {
        const h = localStorage.getItem(History.key_name);

        // When history key doesn't exist
        if (!h) return h as null;

        // Return parsed history data
        return JSON.parse(h);
    }

    /** Update old history to new history */
    public updateHistory(newHistory: Partial<HistoryData>): OldHistoryData {
        // Keep old history data
        const old = this.content;

        // Rechange old history to new history
        this.content = { ...(old || {}), ...(newHistory as Required<HistoryData>) };

        // Save updated history into user localStorage memory space
        this.saveHistory();

        // Return old history version
        return old;
    }

    /** Save already existing history content in user **window.localStorage** memory space */
    public saveHistory(): void {
        // Parse history content
        const p = JSON.stringify(this.content);

        // Save history content
        localStorage.setItem(History.key_name, p);
    }
}