import { PUBLIC_STRAPI_URL } from '$env/static/public';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, params }) {
	const { slug } = params;

	const response = await fetch(
		`${PUBLIC_STRAPI_URL}/api/case-studies?filters[slug][$eq]=${slug}&populate=*`
	);

	if (!response.ok) {
		throw error(500, 'Failed to fetch case study');
	}

	const apiData = await response.json();

	if (apiData.data.length === 0) {
		throw error(404, 'Case study not found');
	}

    // Get the first item directly. No need to flatten.
    const caseStudy = apiData.data[0];

	return {
		caseStudy
	};
}