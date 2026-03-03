import { CaseStudyService } from '$lib/server/services/CaseStudyService';
// import { desc } from 'drizzle-orm'; // Service handles ordering

export async function load() {
	const service = new CaseStudyService();
	const result = await service.listCaseStudies(); // returns { caseStudies, ... } or array?
	// CaseStudyRepository returns { caseStudies, ... }
	// CaseStudyService listCaseStudies calls findMany which returns ^
	const caseStudies = result.caseStudies || [];

	return { caseStudies };
}