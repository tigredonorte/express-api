import { config } from 'dotenv';
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import path from 'path';

import { resolver } from './graphql/resolvers';
import { schema } from './graphql/schema';
import { Database } from './utils/database';
import { notFoundError, unhandledError } from './utils/middlewares/errorHandler';
import { parseMultipart } from './utils/middlewares/fileUpload';
import { userGuard } from './utils/middlewares/route-guard';
import { secureMiddleware } from './utils/middlewares/secureApp';

const app = express();
if (process.env.NODE_ENV !== 'production') {
  config();
}

// static resources
app.use(express.static(path.join('')));

// handful middlewares
app.use(secureMiddleware);
app.use(express.json());
app.use(parseMultipart);
app.use(userGuard);

// graphql
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue: resolver,
    graphiql: true,
    customFormatErrorFn: (err) => {
      try {
        console.log(err);
        console.log(err.message);
        return JSON.parse(err.message);
      } catch {
        return err;
      }
    },
  })
);

// not found
app.use(notFoundError);

// error handling
app.use(unhandledError);

Database.init(() => app.listen('8080', () => console.log('\nRunning on port 8080\n')));
