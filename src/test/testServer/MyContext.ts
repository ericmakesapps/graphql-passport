import { PassportContext } from '../../types';
import { UserAPI, User } from './UserAPI';
import { LaunchAPI } from './LaunchAPI';

export interface MyDataSources {
  readonly userAPI: UserAPI;
  readonly launchAPI: LaunchAPI;
}

export interface MyContext extends PassportContext<User, {}> {
  dataSources: MyDataSources;
}
