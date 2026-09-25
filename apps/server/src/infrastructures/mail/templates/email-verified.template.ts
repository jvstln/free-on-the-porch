import { env } from "@free-on-the-porch/env/private";

export type VerificationFlowType =
	| "email-verification"
	| "link-password"
	| "reset-password"
	| "generic";

export interface VerificationCallbackOptions {
	error?: string;
	title?: string;
	subtitle?: string;
	redirect?: string;
	type?: VerificationFlowType | string;
	appName?: string;
}

interface ResolvedErrorInfo {
	title: string;
	subtitle: string;
	reason: string;
	code?: string;
	isExpired: boolean;
	actionSuggestion: string;
}

const escapeHtml = (str?: string): string => {
	if (!str) return "";
	return String(str)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
};

const resolveErrorInfo = (
	error?: string,
	customTitle?: string,
	customSubtitle?: string,
): ResolvedErrorInfo | null => {
	if (!error) return null;

	const rawError = (error || "").trim();
	const normalizedCode = rawError.toUpperCase().replace(/[\s-]+/g, "_");

	const isExpired =
		normalizedCode.includes("EXPIRED") ||
		rawError.toLowerCase().includes("expired");

	const defaultTitle = isExpired
		? "Verification Link Expired"
		: "Verification Failed";
	const defaultSubtitle = isExpired
		? "This verification link has expired or has already been used. Please return to the app to request a new link."
		: "We couldn't verify your email address with this link.";

	let title = customTitle || defaultTitle;
	let subtitle = customSubtitle || defaultSubtitle;
	let [, code, reason] = error.match(/^(?:([^:]+):\s*)?([^:]+)$/) ?? [];

	let actionSuggestion =
		"Please return to the app to try again or request a new link.";

	if (isExpired) {
		code = "TOKEN_EXPIRED";
		reason =
			reason ||
			"This verification link has expired. Security links are time-limited for your protection.";
		actionSuggestion =
			"Please return to the app and request a new verification link.";
	} else if (
		normalizedCode === "INVALID_TOKEN" ||
		normalizedCode.includes("TOKEN")
	) {
		title = customTitle || "Invalid Link";
		subtitle =
			customSubtitle ||
			"This verification link appears to be invalid or incomplete.";
		reason =
			reason ||
			"The verification token could not be validated. It may have been broken or altered.";
		code = "INVALID_TOKEN";
		actionSuggestion =
			"Make sure you opened the full link, or request a fresh email from the app.";
	} else if (
		normalizedCode === "USER_NOT_FOUND" ||
		normalizedCode.includes("USER_NOT_FOUND")
	) {
		title = customTitle || "Account Not Found";
		subtitle =
			customSubtitle ||
			"We couldn't find an account matching this verification link.";
		reason =
			reason || "No active account was found for this verification token.";
		code = "USER_NOT_FOUND";
		actionSuggestion =
			"Verify the email address you signed up with or create an account in the app.";
	} else if (normalizedCode === "INVALID_USER") {
		title = customTitle || "Account Mismatch";
		subtitle =
			customSubtitle ||
			"This link does not match your currently active session.";
		reason =
			reason ||
			"The user account associated with this verification link differs from the one currently signed in.";
		code = "INVALID_USER";
		actionSuggestion =
			"Sign out and log in with the correct account before opening this link.";
	} else if (
		rawError === "User verification request not found" ||
		normalizedCode === "NOT_FOUND"
	) {
		title = customTitle || "Verification Request Not Found";
		subtitle =
			customSubtitle ||
			"We couldn't find an active verification request for this link.";
		reason =
			reason ||
			"The verification request was not found. It may have expired or already been completed.";
		code = "NOT_FOUND";
		actionSuggestion =
			"Try signing in to the app, or request another verification email.";
	}

	return {
		title,
		subtitle,
		reason: reason || error,
		code,
		isExpired,
		actionSuggestion,
	};
};

export const getVerificationStatusHtml = ({
	type = "email-verification",
	error,
	title: customTitle,
	subtitle: customSubtitle,
	redirect,
	appName = env.PUBLIC_APP_NAME,
}: VerificationCallbackOptions): string => {
	const errorInfo = resolveErrorInfo(error, customTitle, customSubtitle);
	const isError = Boolean(errorInfo);
	const defaultRedirect = `${env.PUBLIC_SCHEME}://dashboard`;
	const targetRedirect = /^\/\??/.test(redirect || "/")
		? defaultRedirect
		: redirect;

	const isResetPassword = type === "reset-password";
	const defaultSuccessTitle = isResetPassword
		? "Password Reset Successfully!"
		: "Email Verified!";
	const defaultSuccessSubtitle = isResetPassword
		? "Your password has been updated. You can now sign in with your new credentials."
		: "Your email address has been successfully verified. Your account is ready for neighborhood treasure hunting and sharing.";

	const heading = errorInfo
		? errorInfo.title
		: customTitle || defaultSuccessTitle;

	const subtitleText = errorInfo
		? errorInfo.subtitle
		: customSubtitle || defaultSuccessSubtitle;

	const pageTitle = `${heading} - ${appName}`;

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
	<title>${escapeHtml(pageTitle)}</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
	<style>
		:root {
			--color-primary: #234a31;
			--color-primary-dark: #173623;
			--color-primary-light: #316342;
			--color-primary-soft: #eaf2ec;
			--color-warm: #8c5828;
			--color-warm-soft: #faecd8;
			--color-canvas: #f8f7f2;
			--color-card: #ffffff;
			--color-border: #e6e4dc;
			--color-border-light: #f0eee7;
			--color-text: #1b1c19;
			--color-text-muted: #58615a;
			--color-text-subtle: #747d76;
			--color-danger: #ba1a1a;
			--color-danger-soft: #ffdad6;
			--shadow-card: 0 24px 48px -12px rgba(35, 74, 49, 0.1), 0 4px 16px -2px rgba(0, 0, 0, 0.04);
			--radius-lg: 24px;
			--radius-md: 16px;
			--radius-sm: 10px;
		}

		* {
			box-sizing: border-box;
			margin: 0;
			padding: 0;
		}

		body {
			min-height: 100vh;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 24px 16px;
			background: radial-gradient(circle at 50% 20%, #ebf2eb 0%, var(--color-canvas) 85%);
			font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			color: var(--color-text);
			-webkit-font-smoothing: antialiased;
			-moz-osx-font-smoothing: grayscale;
		}

		.container {
			width: 100%;
			max-width: 520px;
			animation: fadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1);
		}

		.card {
			background: var(--color-card);
			border: 1px solid var(--color-border);
			border-radius: var(--radius-lg);
			box-shadow: var(--shadow-card);
			padding: 40px 32px;
			text-align: center;
			position: relative;
			overflow: hidden;
		}

		.card-glow {
			position: absolute;
			top: -120px;
			left: 50%;
			transform: translateX(-50%);
			width: 320px;
			height: 240px;
			background: ${isError ? "radial-gradient(ellipse, rgba(186, 26, 26, 0.15), transparent 70%)" : "radial-gradient(ellipse, rgba(49, 99, 66, 0.18), transparent 70%)"};
			pointer-events: none;
		}

		.brand-header {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 12px;
			margin-bottom: 28px;
		}

		.brand-logo {
			width: 44px;
			height: 44px;
			background: var(--color-primary);
			border-radius: 12px;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 4px 12px rgba(35, 74, 49, 0.25);
			transform: rotate(-3deg);
			transition: transform 0.2s ease;
		}

		.brand-logo:hover {
			transform: rotate(0deg) scale(1.05);
		}

		.brand-logo svg {
			width: 26px;
			height: 26px;
			fill: #ffffff;
		}

		.brand-name {
			font-size: 20px;
			font-weight: 800;
			color: var(--color-primary);
			letter-spacing: -0.5px;
		}

		/* Badge Animation */
		.badge-wrap {
			position: relative;
			width: 96px;
			height: 96px;
			margin: 0 auto 24px;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.badge-bg {
			position: absolute;
			inset: 0;
			border-radius: 50%;
			background: ${isError ? "var(--color-danger-soft)" : "var(--color-primary-soft)"};
			animation: pulseGlow 2.5s infinite ease-in-out;
		}

		.badge-icon {
			position: relative;
			z-index: 2;
			width: 54px;
			height: 54px;
		}

		.circle-draw {
			stroke: ${isError ? "var(--color-danger)" : "var(--color-primary-light)"};
			stroke-width: 3;
			stroke-dasharray: 200;
			stroke-dashoffset: 200;
			animation: drawCircle 0.8s 0.1s cubic-bezier(0.65, 0, 0.45, 1) forwards;
		}

		.check-draw {
			stroke: ${isError ? "var(--color-danger)" : "var(--color-primary)"};
			stroke-width: 4;
			stroke-linecap: round;
			stroke-linejoin: round;
			stroke-dasharray: 60;
			stroke-dashoffset: 60;
			animation: drawCheck 0.5s 0.65s cubic-bezier(0.65, 0, 0.45, 1) forwards;
		}

		h1 {
			font-size: 26px;
			font-weight: 800;
			color: var(--color-text);
			letter-spacing: -0.6px;
			line-height: 1.25;
			margin-bottom: 12px;
		}

		.subtitle {
			font-size: 15px;
			line-height: 1.6;
			color: var(--color-text-muted);
			margin-bottom: 24px;
			max-width: 440px;
			margin-left: auto;
			margin-right: auto;
		}

		/* Error Reason Card */
		.error-reason-card {
			background: #fff8f7;
			border: 1px solid #fed7d7;
			border-left: 4px solid var(--color-danger);
			border-radius: var(--radius-md);
			padding: 18px 20px;
			text-align: left;
			margin-bottom: 24px;
			animation: fadeIn 0.3s ease;
		}

		.error-reason-header {
			display: flex;
			align-items: center;
			gap: 8px;
			margin-bottom: 8px;
		}

		.error-reason-icon-wrap {
			color: var(--color-danger);
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.error-reason-title {
			font-size: 12px;
			font-weight: 800;
			text-transform: uppercase;
			letter-spacing: 0.6px;
			color: var(--color-danger);
		}

		.error-code-badge {
			margin-left: auto;
			background: var(--color-danger-soft);
			color: #7f1d1d;
			font-size: 11px;
			font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
			font-weight: 700;
			padding: 2px 8px;
			border-radius: 6px;
			border: 1px solid #fca5a5;
		}

		.error-reason-message {
			font-size: 14.5px;
			line-height: 1.5;
			color: #450a0a;
			font-weight: 600;
			margin-bottom: 8px;
		}

		.error-reason-hint {
			font-size: 13px;
			line-height: 1.5;
			color: #78350f;
			background: #fffbeb;
			border: 1px solid #fde68a;
			border-radius: var(--radius-sm);
			padding: 8px 12px;
			margin-top: 10px;
		}

		.error-reason-hint strong {
			color: #92400e;
		}

		/* Device Specific Banner */
		.device-banner {
			display: none;
			padding: 12px 16px;
			border-radius: var(--radius-sm);
			background: #f4f6f4;
			border: 1px solid #d9e2db;
			margin-bottom: 24px;
			font-size: 13.5px;
			font-weight: 500;
			color: var(--color-primary-dark);
			animation: fadeIn 0.3s ease;
		}

		.device-banner.visible {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 8px;
		}

		.spinner {
			width: 14px;
			height: 14px;
			border: 2px solid rgba(35, 74, 49, 0.2);
			border-top-color: var(--color-primary);
			border-radius: 50%;
			animation: spin 0.8s linear infinite;
		}

		/* Steps Card (Desktop) */
		.desktop-steps {
			background: #faf9f6;
			border: 1px solid var(--color-border);
			border-radius: var(--radius-md);
			padding: 20px;
			text-align: left;
			margin-bottom: 28px;
		}

		.steps-title {
			font-size: 13px;
			text-transform: uppercase;
			letter-spacing: 0.8px;
			font-weight: 700;
			color: var(--color-warm);
			margin-bottom: 14px;
			display: flex;
			align-items: center;
			gap: 6px;
		}

		.steps-list {
			list-style: none;
			display: flex;
			flex-direction: column;
			gap: 12px;
		}

		.step-item {
			display: flex;
			align-items: flex-start;
			gap: 12px;
			font-size: 14px;
			color: var(--color-text);
			line-height: 1.45;
		}

		.step-number {
			width: 22px;
			height: 22px;
			border-radius: 50%;
			background: var(--color-primary-soft);
			color: var(--color-primary);
			font-size: 12px;
			font-weight: 700;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			margin-top: 1px;
		}

		/* Buttons */
		.btn-group {
			display: flex;
			flex-direction: column;
			gap: 12px;
		}

		.btn {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: 10px;
			padding: 14px 24px;
			border-radius: var(--radius-md);
			font-size: 15px;
			font-weight: 700;
			text-decoration: none;
			cursor: pointer;
			transition: all 0.18s ease;
			border: 1px solid transparent;
		}

		.btn-primary {
			background: var(--color-primary);
			color: #ffffff;
			box-shadow: 0 4px 14px rgba(35, 74, 49, 0.25);
		}

		.btn-primary:hover {
			background: var(--color-primary-dark);
			transform: translateY(-1px);
			box-shadow: 0 6px 18px rgba(35, 74, 49, 0.32);
		}

		.btn-primary:active {
			transform: translateY(0);
		}

		.btn-secondary {
			background: #ffffff;
			color: var(--color-text);
			border-color: var(--color-border);
		}

		.btn-secondary:hover {
			background: #faf9f6;
			border-color: #d1cfc5;
		}

		.footer-note {
			margin-top: 24px;
			font-size: 12.5px;
			color: var(--color-text-subtle);
			line-height: 1.5;
		}

		/* Animations */
		@keyframes fadeIn {
			from { opacity: 0; transform: translateY(14px); }
			to { opacity: 1; transform: translateY(0); }
		}

		@keyframes drawCircle {
			to { stroke-dashoffset: 0; }
		}

		@keyframes drawCheck {
			to { stroke-dashoffset: 0; }
		}

		@keyframes pulseGlow {
			0%, 100% { transform: scale(1); opacity: 0.9; }
			50% { transform: scale(1.08); opacity: 0.6; }
		}

		@keyframes spin {
			to { transform: rotate(360deg); }
		}

		@media (max-width: 480px) {
			.card {
				padding: 32px 20px;
			}
			h1 {
				font-size: 22px;
			}
			.subtitle {
				font-size: 14px;
			}
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="card">
			<div class="card-glow"></div>

			<!-- Brand Header -->
			<div class="brand-header">
				<div class="brand-logo" aria-hidden="true">
					<svg viewBox="0 0 597.34 559.12">
						<g transform="translate(-38.42,-440.6)">
							<path d="M346.37 441.22c-1.59-.22-3.15-.1-5.26.03-7.76.5-2.97-2.45-48.85 30.2-18.43 13.12-36.74 26.14-40.7 28.93-3.96 2.8-13.41 9.58-21 15.06-7.6 5.48-20.56 14.8-28.81 20.72l-15 10.75-.27-19.65c-.17-12.42.1-20.03.75-20.67 1.83-1.84 1.16-7.85-1.15-10.31-3.22-3.43-46.88-3.64-51.2-.24-2.72 2.14-3.76 8.11-1.63 9.43.64.4.98 14.7.95 39.8l-.05 39.2-33.08 23.5c-45.8 32.54-48.67 34.7-50.87 38.31-5.99 9.82 2.78 23.69 14.98 23.69 5.65 0 6.5-.46 23.82-12.74l17.3-12.28.26 108.83.25 108.84h25l.27-118 .26-118 3.24-2.16c5.53-3.7 16.42-11.42 38.73-27.48 26.36-18.96 24.25-17.69 22.53-13.59-5.93 14.2-8.29 58.44-4.22 79.23 7.4 37.86 19.63 64.25 74.2 160 11.08 19.44 49.1 86.8 52.5 93 21.34 38.96 22.59 40.57 32.75 42.1 10.17 1.52 15.72-3.16 26.82-22.6 4.24-7.42 13.66-23.85 20.93-36.5 91.17-158.62 102.62-180.73 113.35-219.02 7.77-27.7 8.23-59.59 1.3-88.61l-1.83-7.64 14.59 10.57c8.02 5.82 21.73 15.74 30.46 22.05l15.87 11.48-.62 5.99c-.35 3.29-.63 73.19-.63 155.33v108.15h-118.59l-5.43 3.25c-16.63 9.93-14.5 40.77 3.31 47.94 3.84 1.55 11.77 1.7 90.71 1.74l86.5.05 5-2.36c9.78-4.61 12.5-9.95 12.5-24.53 0-20.63-5.57-25.32-31-26.1l-16.5-.5-.26-146.32-.25-146.33 6.75 4.76c3.72 2.62 9.27 6.51 12.33 8.65 9.55 6.66 18.05 5.7 24.52-2.78 6.7-8.79 4.18-17.72-7.24-25.65-4.32-3-20.9-14.84-36.85-26.31-15.95-11.47-37.33-26.77-47.5-34-30.5-21.7-57.95-41.4-67.5-48.48-4.95-3.66-15.08-11-22.5-16.33-15.63-11.2-41.22-29.64-72.5-52.25-20.65-14.92-25.63-18.55-30.39-19.2z"/>
						</g>
					</svg>
				</div>
				<span class="brand-name">${escapeHtml(appName)}</span>
			</div>

			<!-- Status Badge -->
			<div class="badge-wrap">
				<div class="badge-bg"></div>
				${
					isError
						? `<svg class="badge-icon" viewBox="0 0 52 52" fill="none">
						<circle class="circle-draw" cx="26" cy="26" r="23" />
						<path class="check-draw" d="M18 18L34 34M34 18L18 34" />
					</svg>`
						: `<svg class="badge-icon" viewBox="0 0 52 52" fill="none">
						<circle class="circle-draw" cx="26" cy="26" r="23" />
						<path class="check-draw" d="M15 27L22 34L37 19" />
					</svg>`
				}
			</div>

			<!-- Main Title & Subtitle -->
			<h1>${escapeHtml(heading)}</h1>
			<p class="subtitle">${escapeHtml(subtitleText)}</p>

			${
				errorInfo
					? `<!-- Error Reason Details Callout -->
				<div class="error-reason-card">
					<div class="error-reason-header">
						<div class="error-reason-icon-wrap" aria-hidden="true">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
								<circle cx="12" cy="12" r="10"/>
								<line x1="12" y1="8" x2="12" y2="12"/>
								<line x1="12" y1="16" x2="12.01" y2="16"/>
							</svg>
						</div>
						<span class="error-reason-title">Reason</span>
						${errorInfo.code ? `<span class="error-code-badge">${escapeHtml(errorInfo.code)}</span>` : ""}
					</div>
					<p class="error-reason-message">${escapeHtml(errorInfo.reason)}</p>
					${
						errorInfo.actionSuggestion
							? `<div class="error-reason-hint">
								<strong>Next step:</strong> ${escapeHtml(errorInfo.actionSuggestion)}
							</div>`
							: ""
					}
				</div>`
					: `<!-- Auto-Redirect Indicator (Mobile) -->
				<div id="mobile-redirect-banner" class="device-banner">
					<div class="spinner"></div>
					<span>Opening ${escapeHtml(appName)} in <strong id="countdown-text">2s</strong>...</span>
				</div>`
			}

			${
				!isError
					? `<!-- Desktop Steps -->
				<div id="desktop-instructions" class="desktop-steps">
					<div class="steps-title">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
							<path d="M12 18h.01"/>
						</svg>
						Next steps on your phone
					</div>
					<ul class="steps-list">
						<li class="step-item">
							<div class="step-number">1</div>
							<div>Open the <strong>${escapeHtml(appName)}</strong> app on your mobile device.</div>
						</li>
						<li class="step-item">
							<div class="step-number">2</div>
							<div>Sign in with your verified email and password.</div>
						</li>
						<li class="step-item">
							<div class="step-number">3</div>
							<div>Discover free porch giveaways or post items in seconds!</div>
						</li>
					</ul>
				</div>`
					: ""
			}

			<!-- Action Buttons -->
			<div class="btn-group">
				${
					isError
						? `<a id="btn-open-app" href="${escapeHtml(targetRedirect)}" class="btn btn-primary">
						Open ${escapeHtml(appName)}
					</a>`
						: `<a id="btn-open-app" href="${escapeHtml(targetRedirect)}" class="btn btn-primary">
						Open ${escapeHtml(appName)} App
					</a>
					<button id="btn-copy-link" type="button" class="btn btn-secondary">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
							<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
						</svg>
						Copy App Deep Link
					</button>`
				}
			</div>

			<p class="footer-note">
				You can safely close this browser window.
			</p>
		</div>
	</div>

	<script>
		(function() {
			var redirectUrl = "${escapeHtml(targetRedirect)}";
			var isError = ${isError};
			var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && window.innerWidth < 768);

			var mobileBanner = document.getElementById("mobile-redirect-banner");
			var desktopInstructions = document.getElementById("desktop-instructions");
			var countdownText = document.getElementById("countdown-text");
			var copyBtn = document.getElementById("btn-copy-link");

			if (isMobile) {
				if (mobileBanner && !isError) {
					mobileBanner.classList.add("visible");
				}
				if (desktopInstructions) {
					desktopInstructions.style.display = "none";
				}

				if (!isError) {
					var secondsLeft = 2;
					var interval = setInterval(function() {
						secondsLeft--;
						if (countdownText) {
							countdownText.textContent = secondsLeft + "s";
						}
						if (secondsLeft <= 0) {
							clearInterval(interval);
							if (mobileBanner) {
								mobileBanner.innerHTML = "<span>Redirecting to app...</span>";
							}
							window.location.href = redirectUrl;
						}
					}, 1000);
				}
			} else {
				if (mobileBanner) {
					mobileBanner.style.display = "none";
				}
			}

			if (copyBtn) {
				copyBtn.addEventListener("click", function() {
					if (navigator.clipboard && navigator.clipboard.writeText) {
						navigator.clipboard.writeText(redirectUrl).then(function() {
							copyBtn.innerHTML = "✓ Link Copied!";
							copyBtn.style.color = "var(--color-primary)";
							copyBtn.style.borderColor = "var(--color-primary)";
							setTimeout(function() {
								copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy App Deep Link';
								copyBtn.style.color = "";
								copyBtn.style.borderColor = "";
							}, 2500);
						});
					}
				});
			}
		})();
	</script>
</body>
</html>`;
};
