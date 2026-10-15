// Babel plugin to add .js extension to relative imports (needed for ESM compatibility)
module.exports = function addJsExtensionPlugin({ types: t }) {
	return {
		name: "add-js-extension",
		visitor: {
			"ImportDeclaration|ExportNamedDeclaration|ExportAllDeclaration"(path) {
				const source = path.node.source

				if (!source) return

				const value = source.value

				if (value.startsWith(".") && !value.endsWith(".js") && !value.endsWith(".json")) {
					source.value = value + ".js"
				}
			}
		}
	}
}
