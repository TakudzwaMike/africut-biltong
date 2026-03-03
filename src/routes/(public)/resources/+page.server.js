import { DocumentService } from '$lib/server/services/DocumentService';
import { CaseStudyService } from '$lib/server/services/CaseStudyService';

export async function load() {
	const documentService = new DocumentService();
	const caseStudyService = new CaseStudyService();

	// Get all documents
	const documents = await documentService.listDocuments();

	// Get all case studies
	const result = await caseStudyService.listCaseStudies();
	const caseStudies = result.caseStudies || [];

	return { documents, caseStudies };
}
