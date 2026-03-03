import { LeadService } from '$lib/server/services/LeadService';

export async function GET() {
	// 1. Fetch all leads
	const leadService = new LeadService();
	const leads = await leadService.getAllLeads();

	// 2. Define CSV Headers
	const headers = [
		'ID',
		'Date',
		'First Name',
		'Last Name',
		'Email',
		'Status',
		'Interest (Solution)',
		'Message'
	];

	// 3. Convert Data to CSV String
	const csvRows = [headers.join(',')];

	for (const row of leads) {
		const values = [
			row.id,
			new Date(row.createdAt).toISOString().split('T')[0], // YYYY-MM-DD
			escapeCsv(row.firstName),
			escapeCsv(row.lastName),
			escapeCsv(row.email),
			row.status,
			escapeCsv(row.solution?.solutionName || 'General Inquiry'),
			escapeCsv(row.message)
		];
		csvRows.push(values.join(','));
	}

	const csvContent = csvRows.join('\n');

	// 4. Return as a Downloadable File
	return new Response(csvContent, {
		headers: {
			'Content-Type': 'text/csv',
			'Content-Disposition': `attachment; filename="leads-export-${new Date().toISOString().split('T')[0]}.csv"`
		}
	});
}

// Helper to handle commas and quotes in CSV data
function escapeCsv(str) {
	if (!str) return '';
	const stringValue = String(str);
	// If the string contains comma, quote or newline, wrap in quotes and escape existing quotes
	if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
		return `"${stringValue.replace(/"/g, '""')}"`;
	}
	return stringValue;
}