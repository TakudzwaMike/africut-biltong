import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// Switch to adapter-node for a server-full application
		adapter: adapter()
	}
};

export default config;