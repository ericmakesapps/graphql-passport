module.exports = {
	presets: [
		[
			"@babel/preset-env",
			{
				targets: {
					node: "current"
				}
			}
		],
		"@babel/typescript"
	],
	env: {
		build: {
			plugins: [["./babel-plugin-add-js-extension.js"]]
		},
		test: {
			plugins: ["@babel/plugin-transform-runtime"]
		}
	}
}
