// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare global {
	namespace App {
		interface Locals {
			user: {
				id: string;
				username: string;
				email: string;
				role: 'admin' | 'store_manager' | 'content_editor' | 'customer';
				firstName: string;
				lastName: string;
				profileImageId?: number | null;
			} | null;
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
			RESEND_API_KEY: string;
			PAYSTACK_SECRET_KEY: string;
			PAYNOW_INTEGRATION_ID: string;
			PAYNOW_INTEGRATION_KEY: string;
		}
	}
}

export { };