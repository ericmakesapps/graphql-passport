import util from 'util';
import Strategy from 'passport-strategy';

function GraphQLLocalStrategy(verify) {
  Strategy.call(this);
  this.name = 'graphql-local';
  this.verify = verify;
}

util.inherits(GraphQLLocalStrategy, Strategy);

GraphQLLocalStrategy.prototype.authenticate = function authenticate(req, options) {
  const { username, email, password } = options;

  const done = (err, user, info) => {
    if (err) { return this.error(err); }
    if (!user) { return this.fail(info); }
    return this.success(user, info);
  };

  this.verify(username || email, password, done);
};

export default GraphQLLocalStrategy;
