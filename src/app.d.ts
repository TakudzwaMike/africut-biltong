// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

// and https://lucia-auth.com/getting-started/sveltekit
declare global {
	namespace App {
		interface Locals {
			user: import('lucia').User | null;
			session: import('lucia').Session | null;
		}
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		interface PrivateEnv {
			IMAGE_PROCESSING_SECRET: string;
			BLOB_READ_WRITE_TOKEN: string;
			CRON_SECRET: string;
		}
	}
}

export {};