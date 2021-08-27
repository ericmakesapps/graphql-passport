import { DataSource } from 'apollo-datasource';

export interface User {
  id: number;
  name: string;
  password: string;
  permission: 'admin' | 'basic';
}

export class UserAPI extends DataSource {
  private users: User[];

  constructor() {
    super();
    this.users = [
      {
        id: 1,
        name: 'regular',
        password: '123abc',
        permission: 'basic',
      },
      {
        id: 2,
        name: 'admin',
        password: '321edf',
        permission: 'admin',
      },
    ];
  }

  static instance: UserAPI | undefined;

  find(id: number) {
    return this.users.find((n) => n.id === id);
  }

  authenticate(name: string, password: string) {
    const user = this.users.find((n) => n.name === name);
    if (!user) {
      return null;
    }
    if (user.password !== password) {
      return null;
    }

    return user;
  }

  public static getInstance() {
    if (UserAPI.instance instanceof UserAPI) {
      return UserAPI.instance;
    }

    UserAPI.instance = new UserAPI();

    return UserAPI.instance;
  }
}
