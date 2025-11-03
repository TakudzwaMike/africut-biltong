import { db } from '$lib/server/db';
import { blogPost, caseStudy, product, solution } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const siteUrl = 'https://vision-ai.tech';

export async function GET() {
	const staticPages = [
		'/',
		'/about',
		'/blog',
		'/case-studies',
		'/contact',
		'/products',
		'/resources',
		'/solutions'
	];

	const [posts, caseStudies, products, solutions] = await Promise.all([
		db.select({ slug: blogPost.slug }).from(blogPost).where(eq(blogPost.isPublished, true)),
		db.select({ slug: caseStudy.slug }).from(caseStudy),
		db.select({ slug: product.slug }).from(product),
		db.select({ slug: solution.slug }).from(solution)
	]);

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticPages
		.map((path) => `<url><loc>${siteUrl}${path}</loc><changefreq>weekly</changefreq></url>`)
		.join('')}
    ${posts
		.map((p) => `<url><loc>${siteUrl}/blog/${p.slug}</loc><changefreq>monthly</changefreq></url>`)
		.join('')}
    ${caseStudies
		.map(
			(cs) => `<url><loc>${siteUrl}/case-studies/${cs.slug}</loc><changefreq>monthly</changefreq></url>`
		)
		.join('')}
    ${products
		.map((p) => `<url><loc>${siteUrl}/products/${p.slug}</loc><changefreq>monthly</changefreq></url>`)
		.join('')}
    ${solutions
		.map(
			(s) => `<url><loc>${siteUrl}/solutions/${s.slug}</loc><changefreq>monthly</changefreq></url>`
		)
		.join('')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml'
		}
	});
}