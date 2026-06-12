import { defineConfig } from "tsdown";

export default defineConfig({
	entry: {
		"schemas/index": "./schemas/index.ts",
		"utils/index": "./utils/index.ts",
		"constants/index": "./constants/index.ts",
	},
	format: ["esm", "cjs"],
	dts: true,
	clean: true,
	copy: ["./assets"],
});
