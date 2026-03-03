import { SolutionService } from '$lib/server/services/SolutionService';

export async function load() {
	const service = new SolutionService();
	const result = await service.listSolutions();
	// SolutionRepository.findMany returns { solutions, ... }
	const solutions = result.solutions || [];

	return { solutions };
}