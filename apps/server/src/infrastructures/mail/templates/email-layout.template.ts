import { env } from "@free-on-the-porch/env/private";

export interface EmailLayoutOptions {
	title: string;
	preheader?: string;
	contentHtml: string;
}

export interface EmailTemplateResult {
	html: string;
	text: string;
}

export const getBaseEmailLayout = ({
	title,
	preheader,
	contentHtml,
}: EmailLayoutOptions): string => {
	const appName = env.PUBLIC_APP_NAME;
	const currentYear = new Date().getFullYear();

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="x-apple-disable-message-reformatting">
	<title>${title}</title>
	<style>
		/* Reset & Core Styles */
		body {
			margin: 0;
			padding: 0;
			width: 100% !important;
			background-color: #faf9f4;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
			-webkit-font-smoothing: antialiased;
			-moz-osx-font-smoothing: grayscale;
			color: #1b1c19;
		}
		img {
			border: 0;
			height: auto;
			line-height: 100%;
			outline: none;
			text-decoration: none;
		}
		table {
			border-collapse: collapse !important;
			mso-table-lspace: 0pt;
			mso-table-rspace: 0pt;
		}
		a {
			color: #316342;
			text-decoration: underline;
		}
		.btn-primary {
			display: inline-block;
			background-color: #316342;
			color: #ffffff !important;
			padding: 14px 28px;
			text-decoration: none !important;
			border-radius: 8px;
			font-weight: 600;
			font-size: 16px;
			text-align: center;
			letter-spacing: 0.5px;
			box-shadow: 0 2px 4px rgba(49, 99, 66, 0.15);
		}
		/* Responsive */
		@media screen and (max-width: 600px) {
			.container {
				width: 100% !important;
				padding: 10px !important;
			}
			.card {
				padding: 24px 20px !important;
			}
		}
	</style>
</head>
<body style="margin:0; padding:0; background-color:#faf9f4; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
	${
		preheader
			? `<span style="display:none;font-size:1px;color:#faf9f4;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</span>`
			: ""
	}
	<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #faf9f4; min-height: 100vh; padding: 40px 0;">
		<tr>
			<td align="center" valign="top">
				<table border="0" cellpadding="0" cellspacing="0" width="100%" class="container" style="max-width: 600px;">
					<!-- Logo/Header -->
					<tr>
						<td align="center" style="padding-bottom: 24px;">
							<table border="0" cellpadding="0" cellspacing="0">
								<tr>
									<td style="background-color: #316342; padding: 12px 20px; border-radius: 12px; font-weight: 700; font-size: 20px; color: #ffffff; letter-spacing: -0.5px; box-shadow: 0 4px 10px rgba(49, 99, 66, 0.15);">
										🏡 ${appName}
									</td>
								</tr>
							</table>
						</td>
					</tr>
					<!-- Card Container -->
					<tr>
						<td>
							<table border="0" cellpadding="0" cellspacing="0" width="100%" class="card" style="background-color: #ffffff; border: 1px solid #c1c9bf; border-radius: 12px; padding: 40px; box-shadow: 0 4px 12px rgba(27, 28, 25, 0.03);">
								<tr>
									<td style="color: #1b1c19; font-size: 16px; line-height: 1.6;">
										${contentHtml}
									</td>
								</tr>
							</table>
						</td>
					</tr>
					<!-- Footer -->
					<tr>
						<td align="center" style="padding: 32px 24px 0 24px; color: #414942; font-size: 13px; line-height: 1.5; text-align: center;">
							<p style="margin: 0 0 12px 0;">
								Sent with 💚 from the <strong>${appName}</strong> team.
							</p>
							<p style="margin: 0 0 16px 0; color: #795932; font-weight: 500;">
								Keeping neighborhoods connected & sharing on the porch.
							</p>
							<hr style="border: 0; border-top: 1px solid #c1c9bf; margin: 16px 0; max-width: 100px;">
							<p style="margin: 0; font-size: 11px; color: #414942; opacity: 0.8;">
								&copy; ${currentYear} ${appName}. All rights reserved.
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>`;
};
