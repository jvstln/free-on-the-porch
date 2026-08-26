import { env } from "@free-on-the-porch/env/private";
import { Injectable } from "@nestjs/common";
import { AppLogger } from "../logger/app-logger.service";
import type { IMailService, MailResponse, SendMailOptions } from "./mail.type";

/**
 * Mock implementation of IMailService that prints the outgoing emails to the console.
 * Used during local development and testing when no real email provider is configured.
 */
class ConsoleMailService implements IMailService {
	private readonly logger = new AppLogger(ConsoleMailService.name);

	async sendMail(options: SendMailOptions): Promise<MailResponse> {
		const recipients = Array.isArray(options.to)
			? options.to.join(", ")
			: options.to;
		this.logger.log(`
======================================================================
[EMAIL OUTBOX MOCK]
To:       ${recipients}
From:     ${options.from?.name || "System"} <${options.from?.email || "noreply"}>
Reply-To: ${options.replyTo || "None"}
Subject:  ${options.subject}
----------------------------------------------------------------------
Text Content:
${options.text || "(No Text)"}
----------------------------------------------------------------------
HTML Content:
${options.html || "(No HTML)"}
======================================================================
		`);
		return {
			success: true,
			messageId: `console-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
		};
	}
}

/**
 * Production implementation of IMailService that sends emails using the Mailjet API via HTTP.
 */
class MailjetMailService implements IMailService {
	private readonly logger = new AppLogger(MailjetMailService.name);

	constructor(
		private readonly apiKey: string,
		private readonly apiSecret: string,
		private readonly defaultFromEmail: string,
		private readonly defaultFromName: string,
	) {}

	async sendMail(options: SendMailOptions): Promise<MailResponse> {
		const toEmails = Array.isArray(options.to) ? options.to : [options.to];
		const toRecipients = toEmails.map((email) => ({ Email: email }));

		const fromEmail = options.from?.email || this.defaultFromEmail;
		const fromName = options.from?.name || this.defaultFromName;

		const payload = {
			Messages: [
				{
					From: {
						Email: fromEmail,
						Name: fromName,
					},
					To: toRecipients,
					Subject: options.subject,
					TextPart: options.text,
					HTMLPart: options.html,
					Headers: options.replyTo
						? { "Reply-To": options.replyTo }
						: undefined,
				},
			],
		};

		try {
			const authHeader = `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString("base64")}`;
			const response = await fetch("https://api.mailjet.com/v3.1/send", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: authHeader,
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorText = await response.text();
				this.logger.error(
					`Mailjet API Error: ${response.status} - ${errorText}`,
				);
				return {
					success: false,
					error: `Mailjet API Error: ${response.status} - ${errorText}`,
				};
			}

			const result = (await response.json()) as any;
			const messageId =
				result.Messages?.[0]?.To?.[0]?.MessageID || `mailjet-${Date.now()}`;
			return {
				success: true,
				messageId: String(messageId),
			};
		} catch (error: any) {
			this.logger.error("Failed to send email via Mailjet", error.stack);
			return {
				success: false,
				error: error.message || "Unknown error",
			};
		}
	}
}

/**
 * MailService serves as the primary gateway (facade) for sending emails in the application.
 * It dynamically delegates the actual email sending operation to either ConsoleMailService
 * (for local development mock printing) or MailjetMailService (for production API delivery)
 * based on the configuration of environment variables.
 */
@Injectable()
export class MailService implements IMailService {
	private readonly delegate: IMailService;

	// provider = env.MAIL_PROVIDER;
	provider = "console";
	fromEmail = env.PUBLIC_EMAIL;
	fromName = env.PUBLIC_APP_NAME;

	constructor(private readonly logger: AppLogger) {
		this.logger.setContext(MailService.name);

		if (
			this.provider === "mailjet" &&
			env.MAILJET_API_KEY &&
			env.MAILJET_SECRET
		) {
			this.logger.log("Initializing Mailjet for MailService.");
			this.delegate = new MailjetMailService(
				env.MAILJET_API_KEY,
				env.MAILJET_SECRET,
				this.fromEmail,
				this.fromName,
			);
		} else {
			if (this.provider === "mailjet") {
				this.logger.warn(
					"Mailjet provider was selected but MAILJET_API_KEY or MAILJET_SECRET is missing. Falling back to Console provider.",
				);
			} else {
				this.logger.log("Initializing Console provider for MailService.");
			}
			this.delegate = new ConsoleMailService();
		}
	}

	async sendMail(options: SendMailOptions): Promise<MailResponse> {
		const fromEmail = options.from?.email || this.fromEmail;
		const fromName = options.from?.name || this.fromName;

		return this.delegate.sendMail({
			...options,
			from: {
				email: fromEmail,
				name: fromName,
			},
		});
	}
}
