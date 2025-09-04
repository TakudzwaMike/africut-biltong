import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';

const resend = new Resend(RESEND_API_KEY);

export async function sendNewLeadNotification(lead) {
	const subject = `New Lead from vision-ai.tech: ${lead.firstName} ${lead.lastName}`;
	const body = `
        <p>A new lead has been submitted via the website contact form.</p>
        <ul>
            <li><strong>Name:</strong> ${lead.firstName} ${lead.lastName}</li>
            <li><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></li>
            ${
				lead.solutionId
					? `<li><strong>Inquired About Solution ID:</strong> ${lead.solutionId}</li>`
					: ''
			}
        </ul>
        <hr>
        <p><strong>Message:</strong></p>
        <p><em>${lead.message}</em></p>
    `;

	try {
		await resend.emails.send({
			from: 'Vision AI Tech <noreply@vision-ai.tech>', // IMPORTANT: Must be a domain you've verified with Resend
			to: ['admin@vision-ai.tech'],
			subject: subject,
			html: body
		});
		console.log('New lead notification email sent successfully.');
	} catch (error) {
		console.error('Failed to send new lead notification email:', error);
		// In a real app, you might add more robust error handling here (e.g., to a logging service)
	}
}