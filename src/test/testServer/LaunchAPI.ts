import { DataSource } from 'apollo-datasource';

export interface Launch {
  id: number;
  name: string;
}

export class LaunchAPI extends DataSource {
  private launches: Launch[];

  constructor() {
    super();
    this.launches = [
      { id: 1, name: 'rocket 1' },
      { id: 2, name: 'rocket 2' },
    ];
  }

  find(id: number) {
    return this.launches.find((l) => l.id === id);
  }

  findName(name: string) {
    return this.launches.find((l) => l.name === name);
  }

  add(name: string) {
    const existingLaunch = this.findName(name);
    if (existingLaunch) {
      throw new Error(`The '${name}' already exists`);
    }
    const maxId = Math.max(...this.launches.map((l) => l.id));
    const newLaunch: Launch = { id: maxId + 1, name };
    this.launches.push(newLaunch);
    return newLaunch;
  }
}
