import { config } from 'dotenv';
import express from 'express';
import path from 'path';

import { FeedRoutes } from './modules/feed/feed.route';
import { AuthRoutes } from './modules/user/auth.route';
import { Database } from './utils/database';
import { notFoundError, unhandledError } from './utils/middlewares/errorHandler';
import { parseMultipart } from './utils/middlewares/fileUpload';
import { authRouteGuard, userGuard } from './utils/middlewares/route-guard';
import { allowedMethods, secureMiddleware } from './utils/middlewares/secureApp';
import { SocketClass } from './utils/socket';

Database.init(() => {});

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

// routes
app.use('/auth', AuthRoutes);
app.use('/feed', authRouteGuard, FeedRoutes);

// not found
app.use(notFoundError);

// error handling
app.use(unhandledError);

new SocketClass(app.listen('8080', () => console.log('\nRunning on port 8080\n'))).init();
