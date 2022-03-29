import express from 'express';
import path from 'path';

import { FeedRoutes } from './modules/feed/feed.route';
import { AuthRoutes } from './modules/user/auth.route';
import { Database } from './utils/database';
import { notFoundError, unhandledError } from './utils/middlewares/errorHandler';
import { parseMultipart } from './utils/middlewares/fileUpload';
import { userGuard } from './utils/middlewares/route-guard';
import { secureMiddleware } from './utils/middlewares/secureApp';

Database.init(() => {});

const app = express();

app.use(express.static(path.join('public')));

// handful middlewares
app.use(secureMiddleware);
app.use(express.json());
app.use(parseMultipart);
app.use(userGuard);

// routes
app.use('/auth', AuthRoutes);
app.use('/feed', FeedRoutes);

// not found
app.use(notFoundError);

// error handling
app.use(unhandledError);

app.listen('8080', () => console.log('\nRunning on port 8080\n'));
