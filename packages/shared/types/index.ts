import type z from "zod";

export type ZodMeta = { examples: z.$output[] };

declare module "zod" {
	interface GlobalMeta extends ZodMeta {}
}
