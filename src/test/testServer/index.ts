import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@as-integrations/express4"
import express, { Express } from "express"
import session from "express-session"
import { agent } from "supertest"

import { buildContext } from "../../index"

import { LaunchAPI } from "./LaunchAPI"
import { MyContext } from "./MyContext"
import resolvers from "./resolvers"
import setupPassport from "./setupPassport"
import typeDefs from "./typeDefs"
import { UserAPI } from "./UserAPI"

jest.unmock("passport")

export const startServer = async (): Promise<Express> => {
	const app = express()
	app.use(
		session({
			secret: "keyboard cat",
			resave: false,
			saveUninitialized: false
		})
	)

	const passport = setupPassport()
	app.use(passport.initialize())
	app.use(passport.session())

	const server = new ApolloServer<MyContext>({
		resolvers,
		typeDefs,
		allowBatchedHttpRequests: false,
		csrfPrevention: false
	})

	await server.start()

	app.use(
		"/graphql",
		express.json(),
		expressMiddleware(server, {
			context: async ({ req, res }: { req: express.Request; res: express.Response }) => {
				const ctx = buildContext({ req, res })
				return {
					...ctx,
					logOut: ctx.logout,
					dataSources: {
						userAPI: UserAPI.getInstance(),
						launchAPI: new LaunchAPI()
					}
				} as unknown as MyContext
			}
		})
	)

	return app
}

export const getServerAgent = async () => {
	const server = await startServer()
	return agent(server)
}
