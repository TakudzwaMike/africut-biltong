import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';

const resend = new Resend(RESEND_API_KEY);
const SENDER_EMAIL = 'Vision AI Tech <noreply@vision-ai.tech>';

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
			from: SENDER_EMAIL,
			to: ['admin@vision-ai.tech'],
			subject: subject,
			html: body
		});
	} catch (error) {
		console.error('Failed to send new lead notification email:', error);
	}
}

export async function sendDocumentDownloadLink(email, documentTitle, fileUrl) {
    const subject = `Your Download: ${documentTitle}`;
    const body = `
        <div style="font-family: sans-serif; color: #12102B;">
            <h1>Here is your requested document.</h1>
            <p>Thank you for your interest in <strong>${documentTitle}</strong>.</p>
            <p>You can download the file using the link below:</p>
            <p>
                <a href="${fileUrl}" style="background-color: #C0D532; color: #12102B; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
                    Download PDF
                </a>
            </p>
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
                If you didn't request this, please ignore this email.
            </p>
        </div>
    `;

    try {
        await resend.emails.send({
            from: SENDER_EMAIL,
            to: [email],
            subject: subject,
            html: body
        });
        return true;
    } catch (error) {
        console.error('Failed to send document link:', error);
        return false;
    }
}