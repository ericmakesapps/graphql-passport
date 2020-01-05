import { agent } from 'supertest';
import server from './testServer';
import urlString from './helpers/urlString';

describe('Test fullscale server implementation', () => {
  const loginQuery = `
  mutation login($name: String!, $password: String!) {
    login(name: $name, password: $password)
  }`;

  const meQuery = `
  {
    me {
      name
    }
  }`;

  test('Retrieve basic queries before logging in', async () => {
    const serverAgent = agent(server);
    let ret = await serverAgent
      .get(urlString({ query: meQuery }))
      .then(({ text }: { text: string }) => JSON.parse(text));

    expect(ret).not.toHaveProperty('errors');
    expect(ret).toHaveProperty('data.me', null);

    ret = await serverAgent
      .get(urlString({ query: '{ version }' }))
      .then(({ text }: { text: string }) => JSON.parse(text));

    expect(ret).not.toHaveProperty('errors');
    expect(ret).toHaveProperty('data.version', '1.0');
  });

  test('Retrieve self after logging in', async () => {
    const variables = {
      name: 'regular',
      password: 'bad password',
    };

    const serverAgent = agent(server);

    let ret = await serverAgent
      .post('/graphql')
      .send({ query: loginQuery, variables })
      .then(({ text }: { text: string }) => JSON.parse(text));

    expect(ret).toHaveProperty('errors.0.message', 'no matching user');

    variables.password = '123abc';

    ret = await serverAgent
      .post('/graphql')
      .send({ query: loginQuery, variables })
      .then(({ text }: { text: string }) => JSON.parse(text));

    expect(ret).not.toHaveProperty('errors');
    expect(ret).toHaveProperty('data.login', true);

    ret = await serverAgent.get(urlString({ query: meQuery })).then(({ text }: { text: string }) => JSON.parse(text));

    expect(ret).not.toHaveProperty('errors');
    expect(ret).toHaveProperty('data.me.name', 'regular');
  });

  test('Authentication at a upper level should prevent access to subelements', async () => {
    const serverAgent = agent(server);
    const query = `
      query find($id: ID!) {
        launch {
          find(id: $id) {
            id
            name
          }
        }
      }
    `;

    let ret = await serverAgent
      .post('/graphql')
      .send({ query, variables: { id: 1 } })
      .then(({ text }: { text: string }) => JSON.parse(text));

    expect(ret).toHaveProperty('errors.0.message', 'You need to be logged in to access launch queries');

    const variables = {
      name: 'regular',
      password: '123abc',
    };

    ret = await serverAgent
      .post('/graphql')
      .send({ query: loginQuery, variables })
      .then(({ text }: { text: string }) => JSON.parse(text));

    expect(ret).not.toHaveProperty('errors');
    expect(ret).toHaveProperty('data.login', true);

    ret = await serverAgent
      .post('/graphql')
      .send({ query, variables: { id: 1 } })
      .then(({ text }: { text: string }) => JSON.parse(text));

    expect(ret).not.toHaveProperty('errors');
    expect(ret).toHaveProperty('data.launch.find.name', 'rocket 1');
  });

  test('Authentication at a upper level should prevent access to subelements with check of user permissions', async () => {
    const serverAgent = agent(server);
    const query = `
      mutation addLaunch($name: String!) {
        launch {
          add(name: $name) {
            id
            name
          }
        }
      }
    `;

    let ret = await serverAgent
      .post('/graphql')
      .send({ query, variables: { name: 'just added this launch' } })
      .then(({ text }: { text: string }) => JSON.parse(text));

    expect(ret).toHaveProperty('errors.0.message', 'You need to be logged in to access launch mutations');

    let variables = {
      name: 'regular',
      password: '123abc',
    };

    ret = await serverAgent
      .post('/graphql')
      .send({ query: loginQuery, variables })
      .then(({ text }: { text: string }) => JSON.parse(text));

    expect(ret).not.toHaveProperty('errors');
    expect(ret).toHaveProperty('data.login', true);

    ret = await serverAgent
      .post('/graphql')
      .send({ query, variables: { name: 'just added this launch' } })
      .then(({ text }: { text: string }) => JSON.parse(text));

    expect(ret).toHaveProperty('errors.0.message', 'You have insufficient privileges for launch mutations');

    variables = {
      name: 'admin',
      password: '321edf',
    };

    ret = await serverAgent
      .post('/graphql')
      .send({ query: loginQuery, variables })
      .then(({ text }: { text: string }) => JSON.parse(text));

    expect(ret).not.toHaveProperty('errors');
    expect(ret).toHaveProperty('data.login', true);

    ret = await serverAgent
      .post('/graphql')
      .send({ query, variables: { name: 'just added this launch' } })
      .then(({ text }: { text: string }) => JSON.parse(text));

    expect(ret).not.toHaveProperty('errors');
    expect(ret).toHaveProperty('data.launch.add.name', 'just added this launch');
  });
});
