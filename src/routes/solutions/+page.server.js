import { PUBLIC_STRAPI_URL } from '$env/static/public';

export async function load({ fetch }) {
    const response = await fetch(`${PUBLIC_STRAPI_URL}/api/solutions`);
    const apiData = await response.json();
    return { solutions: apiData.data };
}