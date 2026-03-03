import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('EmailService');

const FROM_ADDRESS = 'Vision AI <no-reply@vision-ai.tech>';

let resend;
if (RESEND_API_KEY) {
    resend = new Resend(RESEND_API_KEY);
} else {
    logger.warn('RESEND_API_KEY is not set. Emails will not be sent.');
}

export class EmailService {
    /**
     * Send a welcome email after public registration.
     */
    static async sendWelcomeEmail(to, firstName) {
        if (!resend) {
            logger.warn(`[DRY RUN] Welcome email would be sent to ${to}`);
            return;
        }

        try {
            const { data, error } = await resend.emails.send({
                from: FROM_ADDRESS,
                to,
                subject: 'Welcome to Vision AI',
                html: buildWelcomeHtml(firstName)
            });

            if (error) {
                logger.error('Failed to send welcome email', error);
                return;
            }

            logger.info(`Welcome email sent to ${to} (id: ${data?.id})`);
        } catch (err) {
            logger.error('Error sending welcome email', err);
        }
    }

    /**
     * Send a staff invite email with a link to create an account.
     */
    static async sendInviteEmail(to, token, role) {
        if (!resend) {
            logger.warn(`[DRY RUN] Invite email would be sent to ${to}`);
            return;
        }

        const inviteUrl = `https://vision-ai.tech/create-account/${token}`;

        try {
            const { data, error } = await resend.emails.send({
                from: FROM_ADDRESS,
                to,
                subject: "You're invited to join Vision AI",
                html: buildInviteHtml(to, inviteUrl, role)
            });

            if (error) {
                logger.error('Failed to send invite email', error);
                return;
            }

            logger.info(`Invite email sent to ${to} (id: ${data?.id})`);
        } catch (err) {
            logger.error('Error sending invite email', err);
        }
    }
}

function buildWelcomeHtml(firstName) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="max-width:560px;margin:40px auto;padding:40px 32px;background:#111;border-radius:16px;border:1px solid #222;">
        <div style="text-align:center;margin-bottom:32px;">
            <h1 style="color:#00e5a0;font-size:28px;margin:0;">Vision AI</h1>
        </div>
        <h2 style="color:#fff;font-size:22px;margin:0 0 16px;">Welcome${firstName ? ', ' + firstName : ''}!</h2>
        <p style="color:#aaa;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Your account has been created successfully. You now have access to our platform where you can explore our AI-powered solutions and services.
        </p>
        <div style="text-align:center;margin:32px 0;">
            <a href="https://vision-ai.tech/account" style="display:inline-block;background:#00e5a0;color:#0a0a0a;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;">
                Go to Your Account
            </a>
        </div>
        <hr style="border:none;border-top:1px solid #222;margin:32px 0;">
        <p style="color:#555;font-size:12px;text-align:center;margin:0;">
            &copy; ${new Date().getFullYear()} Vision AI Technologies. All rights reserved.
        </p>
    </div>
</body>
</html>`;
}

function buildInviteHtml(email, inviteUrl, role) {
    const roleName = role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="max-width:560px;margin:40px auto;padding:40px 32px;background:#111;border-radius:16px;border:1px solid #222;">
        <div style="text-align:center;margin-bottom:32px;">
            <h1 style="color:#00e5a0;font-size:28px;margin:0;">Vision AI</h1>
        </div>
        <h2 style="color:#fff;font-size:22px;margin:0 0 16px;">You've Been Invited</h2>
        <p style="color:#aaa;font-size:15px;line-height:1.6;margin:0 0 8px;">
            You've been invited to join the Vision AI team as a <strong style="color:#fff;">${roleName}</strong>.
        </p>
        <p style="color:#aaa;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Click the button below to set up your account. This link expires in 7 days.
        </p>
        <div style="text-align:center;margin:32px 0;">
            <a href="${inviteUrl}" style="display:inline-block;background:#00e5a0;color:#0a0a0a;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;">
                Create Your Account
            </a>
        </div>
        <p style="color:#666;font-size:13px;line-height:1.5;margin:24px 0 0;">
            If the button doesn't work, copy and paste this URL into your browser:<br>
            <a href="${inviteUrl}" style="color:#00e5a0;word-break:break-all;">${inviteUrl}</a>
        </p>
        <hr style="border:none;border-top:1px solid #222;margin:32px 0;">
        <p style="color:#555;font-size:12px;text-align:center;margin:0;">
            &copy; ${new Date().getFullYear()} Vision AI Technologies. All rights reserved.
        </p>
    </div>
</body>
</html>`;
}
