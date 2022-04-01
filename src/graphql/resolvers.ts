import { postsResolver } from '../modules/feed/feed/feed.resolvers';
import { authResolvers } from '../modules/user/auth/auth.resolvers';

export const resolver = {
  ...postsResolver,
  ...authResolvers,
};
