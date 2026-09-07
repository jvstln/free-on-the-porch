import { env } from "@free-on-the-porch/env/private";
import {
	type EmailTemplateResult,
	getBaseEmailLayout,
} from "./email-layout.template";

export interface EmailVerificationOptions {
	email: string;
	url: string;
}

export const getEmailVerificationTemplate = ({
	url,
}: EmailVerificationOptions): EmailTemplateResult => {
	const title = `Verify your email - ${env.PUBLIC_APP_NAME}`;
	const appName = env.PUBLIC_APP_NAME;

	const html = getBaseEmailLayout({
		title,
		preheader: `Welcome to ${appName}! Confirm your email address.`,
		contentHtml: `
			<h1 style="color: #316342; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.5px;">Welcome to ${appName}!</h1>
			<p style="margin-top: 0; margin-bottom: 20px; font-size: 16px; color: #1b1c19;">Thank you for signing up. We're excited to welcome you to our neighborhood! To get started, please confirm your email address by clicking the button below:</p>
			
			<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
				<tr>
					<td align="center">
						<a href="${url}" class="btn-primary" target="_blank">Verify Email Address</a>
					</td>
				</tr>
			</table>

			<p style="margin-bottom: 8px; color: #414942; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
			<p style="margin-bottom: 24px; word-break: break-all; font-size: 13px; background-color: #efeee9; padding: 12px; border-radius: 8px; border: 1px solid #c1c9bf; margin-top: 0;">
				<a href="${url}" style="color: #795932; text-decoration: none; font-family: monospace;">${url}</a>
			</p>

			<hr style="border: 0; border-top: 1px solid #efeee9; margin: 24px 0;">
			<p style="color: #414942; font-size: 13px; margin: 0; line-height: 1.4;">If you did not sign up for an account on ${appName}, you can safely ignore this email.</p>
		`,
	});

	const text = `Welcome to ${appName}!\n\nPlease verify your email address by clicking the link: ${url}`;

	return { html, text };
};
