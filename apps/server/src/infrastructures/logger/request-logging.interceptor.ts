import {
	type CallHandler,
	type ExecutionContext,
	Injectable,
	type NestInterceptor,
} from "@nestjs/common";
import type { Request, Response } from "express";
import type { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AppLogger } from "./app-logger.service";

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
	constructor(private readonly logger: AppLogger) {
		this.logger.setContext("RequestLogging");
	}

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const httpContext = context.switchToHttp();
		const request = httpContext.getRequest<Request>();
		const response = httpContext.getResponse<Response>();

		const { method, originalUrl, ip, body: reqBody } = request;
		const userAgent = request.get("user-agent") || "";
		const startTime = Date.now();

		// Log incoming request
		const sanitizedReqBody = this.formatBody(reqBody);
		const reqMessage = `--> ${method} ${originalUrl}${
			sanitizedReqBody ? ` | Body: ${sanitizedReqBody}` : ""
		} (IP: ${ip}, UA: ${userAgent})`;
		this.logger.log(reqMessage);

		return next.handle().pipe(
			tap({
				next: (data) => {
					const duration = Date.now() - startTime;
					const statusCode = response.statusCode;
					const sanitizedResBody = this.formatBody(data);

					const resMessage = `<-- ${method} ${originalUrl} ${statusCode} +${duration}ms${
						sanitizedResBody ? ` | Body: ${sanitizedResBody}` : ""
					}`;

					if (statusCode >= 500) {
						this.logger.error(resMessage);
					} else if (statusCode >= 400) {
						this.logger.warn(resMessage);
					} else {
						this.logger.log(resMessage);
					}
				},
				error: (error) => {
					const duration = Date.now() - startTime;
					const statusCode = error.status || error.statusCode || 500;
					const errorMessage = error.message || "Internal server error";

					const errMessage = `<-- ${method} ${originalUrl} ${statusCode} +${duration}ms | Error: ${errorMessage}`;
					this.logger.error(errMessage);
				},
			}),
		);
	}

	private sanitize(obj: unknown): unknown {
		if (!obj || typeof obj !== "object") return obj;

		if (Array.isArray(obj)) {
			return obj.map((item) => this.sanitize(item));
		}

		const sanitized: Record<string, unknown> = { ...(obj as object) };
		const sensitiveKeys = [
			"password",
			"token",
			"accessToken",
			"refreshToken",
			"clientSecret",
			"secret",
			"authorization",
		];

		for (const key of Object.keys(sanitized)) {
			if (sensitiveKeys.includes(key.toLowerCase())) {
				sanitized[key] = "***REDACTED***";
			} else if (typeof sanitized[key] === "object") {
				sanitized[key] = this.sanitize(sanitized[key]);
			}
		}

		return sanitized;
	}

	private formatBody(body: unknown): string {
		if (body === undefined || body === null) return "";

		let str = "";
		try {
			if (typeof body === "string") {
				try {
					const parsed = JSON.parse(body);
					str = JSON.stringify(this.sanitize(parsed));
				} catch {
					str = body;
				}
			} else if (typeof body === "object") {
				str = JSON.stringify(this.sanitize(body));
			} else {
				str = String(body);
			}
		} catch {
			str = "[Unparsable body]";
		}

		if (str.length > 1000) {
			return `${str.substring(0, 1000)}... (truncated)`;
		}
		return str;
	}
}
