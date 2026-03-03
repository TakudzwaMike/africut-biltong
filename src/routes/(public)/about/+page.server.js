import { PageContentService } from '$lib/server/services/PageContentService';
import { TeamService } from '$lib/server/services/TeamService';

export async function load() {
	const pageContentService = new PageContentService();
	const teamService = new TeamService();

	// Get all page content for 'about' page
	const contentList = await pageContentService.getContentByPage('about');

	// Convert array to object keyed by section
	const content = contentList.reduce((acc, item) => {
		acc[item.section] = item;
		return acc;
	}, /** @type {Record<string, any>} */({}));

	// Get all team members
	const teamMembers = await teamService.listTeamMembers();

	return { content, teamMembers };
}