export interface SendMailOptions {
	to: string | string[];
	subject: string;
	text?: string;
	html?: string;
	from?: {
		email: string;
		name?: string;
	};
	replyTo?: string;
}

export interface MailResponse {
	success: boolean;
	messageId?: string;
	error?: string;
}

export interface IMailService {
	sendMail(options: SendMailOptions): Promise<MailResponse>;
}
