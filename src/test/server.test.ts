import urlString from './helpers/urlString';
import { getServerAgent } from './testServer';

jest.unmock('passport');

describe('Test fullscale server implementation', () => {
  const loginQuery = `
    mutation login($name: String!, $password: String!) {
      login(name: $name, password: $password) {
        name
      }
    }
  `;

  const logoutQuery = `
    mutation logout {
      logout
    }
  `;

  const meQuery = `
    query getMyName {
      me {
        name
      }
    }
  `;

  test('Retrieve basic queries before logging in', async () => {
    const serverAgent = await getServerAgent();
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

  test('Retrieve self after logging in up until logout', async () => {
    const serverAgent = await getServerAgent();

    const variables = {
      name: 'regular',
      password: 'bad password',
    };

    let ret = await serverAgent
      .post('/graphql')
      .send({ query: loginQuery, variables })
      .then(({ text }: { text: string }) => JSON.parse(text));

    expect(ret).toHaveProperty(
      'errors',
      expect.arrayContaining([
        expect.objectContaining({ message: expect.stringContaining('failed to authenticate user') }),
      ]),
    );

    variables.password = '123abc';

    ret = await serverAgent
      .post('/graphql')
      .send({ query: loginQuery, variables })
      .then(({ text }: { text: string }) => JSON.parse(text));

    expect(ret).not.toHaveProperty('errors');
    expect(ret).toHaveProperty('data.login.name', variables.name);

    ret = await serverAgent.get(urlString({ query: meQuery })).then(({ text }: { text: string }) => JSON.parse(text));

    expect(ret).not.toHaveProperty('errors');
    expect(ret).toHaveProperty('data.me.name', 'regular');

    ret = await serverAgent
      .post('/graphql')
      .send({ query: logoutQuery })
      .then(({ text }: { text: string }) => JSON.parse(text));
    expect(ret).not.toHaveProperty('errors');

    ret = await serverAgent.get(urlString({ query: meQuery })).then(({ text }: { text: string }) => JSON.parse(text));

    expect(ret).not.toHaveProperty('errors');
    expect(ret).toHaveProperty('data.me', null);
  });

  test('Authentication at a upper level should prevent access to subelements', async () => {
    const serverAgent = await getServerAgent();
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
    expect(ret).toHaveProperty('data.login.name', variables.name);

    ret = await serverAgent
      .post('/graphql')
      .send({ query, variables: { id: 1 } })
      .then(({ text }: { text: string }) => JSON.parse(text));

    expect(ret).not.toHaveProperty('errors');
    expect(ret).toHaveProperty('data.launch.find.name', 'rocket 1');
  });

  test('Authentication at a upper level should prevent access to subelements with check of user permissions', async () => {
    const serverAgent = await getServerAgent();
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
    expect(ret).toHaveProperty('data.login.name', variables.name);

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
    expect(ret).toHaveProperty('data.login.name', variables.name);

    ret = await serverAgent
      .post('/graphql')
      .send({ query, variables: { name: 'just added this launch' } })
      .then(({ text }: { text: string }) => JSON.parse(text));

    expect(ret).not.toHaveProperty('errors');
    expect(ret).toHaveProperty('data.launch.add.name', 'just added this launch');
  });
});
