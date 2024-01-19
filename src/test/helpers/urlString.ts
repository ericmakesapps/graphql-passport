import { stringify } from "query-string"

function urlString(urlParams: object, basePath: string = "/graphql") {
	let string = basePath
	if (urlParams) {
		string += `?${stringify(urlParams)}`
	}
	return string
}

export default urlString
