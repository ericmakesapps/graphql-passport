import { stringify } from 'query-string';

export default (urlParams: {}, basePath: string = '/graphql') => {
  let string = basePath;
  if (urlParams) {
    string += `?${stringify(urlParams)}`;
  }
  return string;
};
