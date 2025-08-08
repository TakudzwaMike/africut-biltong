import { PUBLIC_STRAPI_URL } from '$env/static/public';

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch }) {
	const response = await fetch(`${PUBLIC_STRAPI_URL}/api/case-studies?populate=*`);
	
	if (!response.ok) {
		console.error(`Failed to fetch case studies: ${response.statusText}`);
		return { caseStudies: [] };
	}

	const apiData = await response.json();

	return {
		caseStudies: apiData.data
	};
}