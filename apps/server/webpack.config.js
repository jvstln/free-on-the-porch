const nodeExternals = require("webpack-node-externals");

module.exports = (options, webpack) => {
	// Find the rule that handles TypeScript files
	const tsRule = options.module.rules.find((rule) =>
		rule.test?.toString().includes("ts"),
	);

	// Replace ts-loader with swc-loader
	if (tsRule) {
		tsRule.use = {
			loader: "swc-loader",
			options: {
				jsc: {
					parser: {
						syntax: "typescript",
						decorators: true,
						dynamicImport: true,
					},
					transform: {
						legacyDecorator: true,
						decoratorMetadata: true,
					},
				},
			},
		};
	}

	return {
		...options,
		externals: [
			nodeExternals({
				allowlist: [/^@free-on-the-porch\/.*/],
			}),
		],
	};
};
