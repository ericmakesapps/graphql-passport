import type { PassportContext } from "../../types"

import type { LaunchAPI } from "./LaunchAPI"
import type { User, UserAPI } from "./UserAPI"

export interface MyDataSources {
	readonly userAPI: UserAPI
	readonly launchAPI: LaunchAPI
}

export interface MyContext extends PassportContext<User, object> {
	dataSources: MyDataSources
}
