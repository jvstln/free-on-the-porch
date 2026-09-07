const dotenv = require("dotenv");
const path = require("node:path");

// Load environment variables from .env at build-time in Metro/Babel
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

module.exports = (api) => {
	api.cache(true);
	return {
		presets: ["babel-preset-expo"],
		plugins: [
			// Custom plugin to inline process.env.PUBLIC_* variables
			function inlinePublicEnvPlugin({ types: t }) {
				return {
					name: "inline-public-env",
					visitor: {
						MemberExpression(nodePath) {
							if (
								nodePath.get("object").matchesPattern("process.env") &&
								nodePath.node.property
							) {
								let key = null;
								if (nodePath.node.computed) {
									// process.env["PUBLIC_..."]
									if (t.isStringLiteral(nodePath.node.property)) {
										key = nodePath.node.property.value;
									}
								} else {
									// process.env.PUBLIC_...
									if (t.isIdentifier(nodePath.node.property)) {
										key = nodePath.node.property.name;
									}
								}

								if (key?.startsWith("PUBLIC_")) {
									const value = process.env[key];
									nodePath.replaceWith(t.valueToNode(value));
								}
							}
						},
					},
				};
			},
		],
	};
};
