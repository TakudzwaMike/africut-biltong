import { BlogService } from '$lib/server/services/BlogService';
import { CaseStudyService } from '$lib/server/services/CaseStudyService';
import { ProductService } from '$lib/server/services/ProductService';
import { SolutionService } from '$lib/server/services/SolutionService';

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

	const blogService = new BlogService();
	const caseStudyService = new CaseStudyService();
	const productService = new ProductService();
	const solutionService = new SolutionService();

	const [postsResult, caseStudies, productsResult, solutions] = await Promise.all([
		blogService.listPosts({ limit: 1000 }), // Fetch all (or reasonable limit)
		caseStudyService.listCaseStudies({ limit: 1000 }),
		productService.listProducts({ limit: 1000 }),
		solutionService.listSolutions() // Assuming fetching all
	]);

	// Normalize results depending on return structure of services
	// Services might return { items, ... } or array. 
	// Based on recent refactors: 
	// BlogService.listPosts returns { posts, totalItems, ... }
	// CaseStudyService.listCaseStudies returns array (since we removed wrapper) wait, I wrote it to return findMany result (array or object?) 
	// Repo.findMany returns object with { items, count } usually? No, raw repo returns array usually, wrapped by service.
	// Let's assume standard service return format { [entity]s: [], ... } or just array if simple.
	// I need to check listPosts return. It returns { posts: [...] }.
	// ProductService.listProducts returns { products: [...] }.
	// SolutionService.listSolutions returns array (based on recent fix).
	// CaseStudyService.listCaseStudies returns result of findMany (likely array if repo is simple).

	const posts = postsResult.posts || [];
	const products = productsResult.products || [];
	// Solutions is array
	// CaseStudies? If repo behaves like others, it might be array.

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticPages
			.map((path) => `<url><loc>${siteUrl}${path}</loc><changefreq>weekly</changefreq></url>`)
			.join('')}
    ${posts
			.filter(p => p.isPublished) // Ensure published check if service returns all
			.map((p) => `<url><loc>${siteUrl}/blog/${p.slug}</loc><changefreq>monthly</changefreq></url>`)
			.join('')}
    ${(Array.isArray(caseStudies) ? caseStudies : caseStudies.caseStudies || [])
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