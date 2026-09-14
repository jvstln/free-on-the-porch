import { fromZodError } from "@free-on-the-porch/shared/schemas";
import {
	BadRequestException,
	Injectable,
	type PipeTransform,
} from "@nestjs/common";
import { ZodType } from "zod";

// Validates a parameter value against a Zod schema. Applied INLINE per
// parameter (never globally): `@Body(new ZodValidationPipe(Schema)) body`.
// On failure throws a BadRequestException with human-readable details from
// fromZodError (the shared zod-validation-error wrapper).
@Injectable()
export class ZodValidationPipe implements PipeTransform {
	constructor(private readonly schema: ZodType) {}

	transform(value: unknown) {
		let parsedValue = value;

		// When receiving multipart/form-data via Multer, non-primitive fields like
		// JSON objects (e.g. location: { lat, lng }) arrive as serialized JSON strings.
		// Preprocess them into objects so Zod object schemas can validate them.
		if (typeof value === "object" && value !== null && !Array.isArray(value)) {
			const obj = { ...(value as Record<string, unknown>) };
			for (const [k, v] of Object.entries(obj)) {
				if (typeof v === "string" && (v.startsWith("{") || v.startsWith("["))) {
					try {
						obj[k] = JSON.parse(v);
					} catch {
						// leave as string if not valid JSON
					}
				}
			}
			parsedValue = obj;
		}

		const result = this.schema.safeParse(parsedValue);

		if (!result.success) {
			const betterError = fromZodError(result.error);

			throw new BadRequestException({
				message: betterError.toString(),
				details: betterError.details,
			});
		}

		return result.data;
	}
}
