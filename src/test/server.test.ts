import * as request from 'supertest';
import server from './testServer';
import urlString from './helpers/urlString';

describe('Test server', () => {
  test('Retrieve self before logging in', async () => {
    const query = `
    {
      me {
        name
      }
    }`;
    const ret = await request
      .agent(server)
      .get(urlString({ query }))
      .then(({ text }: { text: string }) => JSON.parse(text));

    expect(ret).not.toHaveProperty('errors');
    expect(ret).toHaveProperty('data.me', null);
  });

  test('Retrieve self after logging in', async () => {
    let query = `
    mutation login($name: String!, $password: String!) {
      login(name: $name, password: $password)
    }`;
    const variables = {
      name: 'regular',
      password: 'bad password',
    };

    const serverAgent = request.agent(server);

    let ret = await serverAgent
      .post('/graphql')
      .send({ query, variables })
      .then(({ text }: { text: string }) => JSON.parse(text));

    expect(ret).toHaveProperty('errors.0.message', 'no matching user');

    variables.password = '123abc';

    ret = await serverAgent
      .post('/graphql')
      .send({ query, variables })
      .then(({ text }: { text: string }) => JSON.parse(text));

    expect(ret).not.toHaveProperty('errors');
    expect(ret).toHaveProperty('data.login', true);

    query = `
    {
      me {
        name
      }
    }`;
    ret = await serverAgent.get(urlString({ query })).then(({ text }: { text: string }) => JSON.parse(text));

    expect(ret).not.toHaveProperty('errors');
    expect(ret).toHaveProperty('data.me.name', 'regular');
  });
});
