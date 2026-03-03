import { BlogService } from '$lib/server/services/BlogService';
import { CaseStudyService } from '$lib/server/services/CaseStudyService';
import { PageContentService } from '$lib/server/services/PageContentService';
import { PartnerService } from '$lib/server/services/PartnerService';
import { SolutionService } from '$lib/server/services/SolutionService';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const blogService = new BlogService();
	const caseStudyService = new CaseStudyService();
	const pageContentService = new PageContentService();
	const partnerService = new PartnerService();
	const solutionService = new SolutionService();

	const [
		caseStudiesResult,
		postsResult,
		clients,
		contentList,
		solutionsResult
	] = await Promise.all([
		caseStudyService.listCaseStudies({ limit: 3 }),
		blogService.listPosts({ limit: 3, publishedOnly: true }),
		partnerService.listPartners({ limit: null, requireLogo: true }),
		pageContentService.getContentByPage('homepage'),
		solutionService.listSolutions({ limit: 3 })
	]);

	// Handle return structures.
	// BlogService -> { posts, ... }
	const posts = postsResult.posts || [];

	// SolutionService -> { solutions, ... }
	const solutions = solutionsResult.solutions || [];

	// PartnerService -> array (from repo)
	// Clients are Partners in this context

	// PageContentService -> array.
	const content = (contentList || []).reduce((acc, item) => {
		acc[item.section] = item;
		return acc;
	}, /** @type {Record<string, any>} */({}));


	// CaseStudyService -> { caseStudies, ... }
	const caseStudies = caseStudiesResult.caseStudies || [];

	return {
		caseStudies,
		posts,
		clients,
		content,
		solutions
	};
}