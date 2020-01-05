import { DataSource } from 'apollo-datasource';

export interface Launch {
  id: string;
  name: string;
}

export class LaunchAPI extends DataSource {
  private launches: Launch[];

  constructor() {
    super();
    this.launches = [
      { id: '123', name: 'rocket 1' },
      { id: '321', name: 'rocket 2' },
    ];
  }

  find(id: string) {
    return this.launches.find(l => l.id === id);
  }
}
