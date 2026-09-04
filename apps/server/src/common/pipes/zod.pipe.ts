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
		const result = this.schema.safeParse(value);

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
