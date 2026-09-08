import { env } from "@free-on-the-porch/env/private";
import { Injectable } from "@nestjs/common";
import axios from "axios";
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
 * Production implementation of IMailService that sends emails using the Mailjet API.
 */
class MailjetMailService implements IMailService {
	private readonly logger = new AppLogger(MailjetMailService.name);

	async sendMail(options: SendMailOptions): Promise<MailResponse> {
		const toEmails = Array.isArray(options.to) ? options.to : [options.to];
		const fromEmail = options.from?.email || env.PUBLIC_EMAIL;
		const fromName = options.from?.name || env.PUBLIC_APP_NAME;

		try {
			const { data } = await axios.post(
				"https://api.mailjet.com/v3.1/send",
				{
					Messages: [
						{
							From: { Email: fromEmail, Name: fromName },
							To: toEmails.map((email) => ({ Email: email })),
							Subject: options.subject,
							TextPart: options.text,
							HTMLPart: options.html,
							Headers: options.replyTo
								? { "Reply-To": options.replyTo }
								: undefined,
						},
					],
				},
				{
					// Keys guaranteed non-null by the MailService guard
					auth: {
						// biome-ignore lint/style/noNonNullAssertion: guarded by MailService
						username: env.MAILJET_API_KEY!,
						// biome-ignore lint/style/noNonNullAssertion: guarded by MailService
						password: env.MAILJET_SECRET!,
					},
					headers: { "Content-Type": "application/json" },
				},
			);

			const messageId =
				data.Messages?.[0]?.To?.[0]?.MessageID || `mailjet-${Date.now()}`;
			return { success: true, messageId: String(messageId) };
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			this.logger.error(`Mailjet API Error: ${message}`);
			return { success: false, error: message };
		}
	}
}

/**
 * Production implementation of IMailService that sends emails using the Resend API.
 */
class ResendMailService implements IMailService {
	private readonly logger = new AppLogger(ResendMailService.name);

	async sendMail(options: SendMailOptions): Promise<MailResponse> {
		const toEmails = Array.isArray(options.to) ? options.to : [options.to];
		const fromEmail = options.from?.email || env.PUBLIC_EMAIL;
		const fromName = options.from?.name || env.PUBLIC_APP_NAME;

		try {
			const { data } = await axios.post(
				"https://api.resend.com/emails",
				{
					from: `${fromName} <${fromEmail}>`,
					to: toEmails,
					subject: options.subject,
					text: options.text,
					html: options.html,
					reply_to: options.replyTo,
				},
				{
					headers: {
						Authorization: `Bearer ${env.RESEND_API_KEY}`,
						"Content-Type": "application/json",
					},
				},
			);

			return { success: true, messageId: data.id || `resend-${Date.now()}` };
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			this.logger.error(`Resend API Error: ${message}`);
			return { success: false, error: message };
		}
	}
}

/**
 * MailService serves as the primary gateway (facade) for sending emails in the application.
 * It dynamically delegates the actual email sending operation to Console, Mailjet, or Resend
 * based on the MAIL_PROVIDER environment variable.
 */
@Injectable()
export class MailService implements IMailService {
	private readonly delegate: IMailService;

	constructor(private readonly logger: AppLogger) {
		this.logger.setContext(MailService.name);

		const provider = env.MAIL_PROVIDER;

		if (provider === "mailjet" && env.MAILJET_API_KEY && env.MAILJET_SECRET) {
			this.logger.log("Initializing Mailjet for MailService.");
			this.delegate = new MailjetMailService();
		} else if (provider === "resend" && env.RESEND_API_KEY) {
			this.logger.log("Initializing Resend for MailService.");
			this.delegate = new ResendMailService();
		} else {
			if (provider === "mailjet") {
				this.logger.warn(
					"Mailjet selected but MAILJET_API_KEY or MAILJET_SECRET missing. Falling back to console.",
				);
			} else if (provider === "resend") {
				this.logger.warn(
					"Resend selected but RESEND_API_KEY missing. Falling back to console.",
				);
			} else {
				this.logger.log("Initializing Console provider for MailService.");
			}
			this.delegate = new ConsoleMailService();
		}
	}

	async sendMail(options: SendMailOptions): Promise<MailResponse> {
		return this.delegate.sendMail({
			...options,
			from: {
				email: options.from?.email || env.PUBLIC_EMAIL,
				name: options.from?.name || env.PUBLIC_APP_NAME,
			},
		});
	}
}
