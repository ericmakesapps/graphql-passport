const passportMock = jest.genMockFromModule<{
	authenticateMiddleware: jest.Mock
	authenticate: jest.Mock
}>("passport")

const authenticateMiddleware = jest.fn()

passportMock.authenticate = jest.fn((name, options, done) => {
	done(null, { id: "user-id" }, { info: true })
	return authenticateMiddleware
})
passportMock.authenticateMiddleware = authenticateMiddleware
export default passportMock
