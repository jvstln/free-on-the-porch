import { env } from "@free-on-the-porch/env/private";
import {
	type EmailTemplateResult,
	getBaseEmailLayout,
} from "./email-layout.template";

export interface ResetPasswordOptions {
	email: string;
	url: string;
}

export const getResetPasswordTemplate = ({
	email,
	url,
}: ResetPasswordOptions): EmailTemplateResult => {
	const title = `Reset your password - ${env.PUBLIC_APP_NAME}`;
	const appName = env.PUBLIC_APP_NAME;

	const html = getBaseEmailLayout({
		title,
		preheader: `Reset your password for ${appName}.`,
		contentHtml: `
			<h1 style="color: #316342; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.5px;">Reset Your Password</h1>
			<p style="margin-top: 0; margin-bottom: 20px; font-size: 16px; color: #1b1c19;">We received a request to reset the password for your <strong>${appName}</strong> account. No worries, it happens! Click the button below to set up a new password:</p>
			
			<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
				<tr>
					<td align="center">
						<a href="${url}" class="btn-primary" target="_blank">Reset Password</a>
					</td>
				</tr>
			</table>

			<p style="margin-bottom: 8px; color: #414942; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
			<p style="margin-bottom: 24px; word-break: break-all; font-size: 13px; background-color: #efeee9; padding: 12px; border-radius: 8px; border: 1px solid #c1c9bf; margin-top: 0;">
				<a href="${url}" style="color: #795932; text-decoration: none; font-family: monospace;">${url}</a>
			</p>

			<hr style="border: 0; border-top: 1px solid #efeee9; margin: 24px 0;">
			<p style="color: #414942; font-size: 13px; margin: 0; line-height: 1.4;">If you did not request a password reset, you can safely ignore this email — your password will remain unchanged.</p>
		`,
	});

	const text = `Reset Your Password\n\nPlease reset your password by clicking the link: ${url}`;

	return { html, text };
};
