function urlString(urlParams: object, basePath: string = "/graphql") {
	let string = basePath
	if (urlParams) {
		string += `?${new URLSearchParams(urlParams as Record<string, string>).toString()}`
	}
	return string
}

export default urlString
