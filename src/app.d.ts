// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import { History } from "$lib/storages/history";

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			history: History
		}
		// interface Platform {}
	}
}

export {};
