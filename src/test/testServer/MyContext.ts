import { PassportContext } from "../../types"

import { LaunchAPI } from "./LaunchAPI"
import { User, UserAPI } from "./UserAPI"

export interface MyDataSources {
	readonly userAPI: UserAPI
	readonly launchAPI: LaunchAPI
}

export interface MyContext extends PassportContext<User, object> {
	dataSources: MyDataSources
}
