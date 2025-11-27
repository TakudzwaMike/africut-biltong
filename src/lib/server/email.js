import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';

const resend = new Resend(RESEND_API_KEY);
const SENDER_EMAIL = 'Vision AI Tech <noreply@vision-ai.tech>';

export async function sendNewLeadNotification(lead) {
    const subject = `New Lead from vision-ai.tech: ${lead.firstName} ${lead.lastName}`;
	const body = `
        <div style="font-family: sans-serif; color: #12102B;">
            <h2>New Lead Notification</h2>
            <p>A new lead has been submitted via the website contact form.</p>
            <ul style="background: #f4f4f5; padding: 20px; border-radius: 8px;">
                <li><strong>Name:</strong> ${lead.firstName} ${lead.lastName}</li>
                <li><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></li>
                ${
                    lead.solutionId 
                        ? `<li><strong>Inquired About Solution ID:</strong> ${lead.solutionId}</li>` 
                        : ''
                }
            </ul>
            <p><strong>Message:</strong></p>
            <blockquote style="border-left: 4px solid #C0D532; padding-left: 10px; margin-left: 0; color: #555;">
                ${lead.message}
            </blockquote>
        </div>
    `;

	try {
		await resend.emails.send({
			from: SENDER_EMAIL,
			to: ['admin@vision-ai.tech'], // Replace with real admin email
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

/**
 * Sends an order confirmation receipt.
 * @param {string} email 
 * @param {object} order - Must include publicId, total, subtotal, discountAmount, currency, and items array.
 */
export async function sendOrderConfirmationEmail(email, order) {
    const currencySymbol = order.currency === 'ZAR' ? 'R' : '$';
    const format = (amount) => `${currencySymbol}${(amount / 100).toFixed(2)}`;

    const itemsHtml = order.items.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0;">
                <strong>${item.productName}</strong>
            </td>
            <td style="padding: 10px 0; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px 0; text-align: right;">${format(Number(item.priceAtPurchase) * item.quantity)}</td>
        </tr>
    `).join('');

    const discountHtml = order.discountAmount > 0 
        ? `
        <tr>
            <td colspan="2" style="padding: 5px 0; text-align: right; color: #16a34a;"><strong>Discount:</strong></td>
            <td style="padding: 5px 0; text-align: right; color: #16a34a;">-${format(order.discountAmount)}</td>
        </tr>`
        : '';

    const body = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #12102B; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="margin-bottom: 10px;">Order Confirmed</h1>
                <p style="color: #666;">Thank you for your purchase. Your order <strong>#${order.publicId}</strong> has been received.</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                    <tr style="border-bottom: 2px solid #eee; color: #888; font-size: 12px; text-transform: uppercase;">
                        <th style="text-align: left; padding-bottom: 10px;">Item</th>
                        <th style="text-align: center; padding-bottom: 10px;">Qty</th>
                        <th style="text-align: right; padding-bottom: 10px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" style="padding: 10px 0; text-align: right;"><strong>Subtotal:</strong></td>
                        <td style="padding: 10px 0; text-align: right;">${format(order.subtotal || order.total)}</td>
                    </tr>
                    ${discountHtml}
                    <tr>
                        <td colspan="2" style="padding: 15px 0; text-align: right; font-size: 18px;"><strong>Total:</strong></td>
                        <td style="padding: 15px 0; text-align: right; font-size: 18px; color: #C0D532; text-shadow: 0 0 1px #000;"><strong>${format(order.total)}</strong></td>
                    </tr>
                </tfoot>
            </table>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #666;">
                    You can track your order status in your <a href="https://vision-ai.tech/account/orders" style="color: #C0D532; font-weight: bold;">Account Dashboard</a>.
                </p>
            </div>
        </div>
    `;

    try {
        await resend.emails.send({
            from: SENDER_EMAIL,
            to: [email],
            subject: `Order Confirmation #${order.publicId}`,
            html: body
        });
    } catch (error) {
        console.error('Failed to send order confirmation:', error);
    }
}
