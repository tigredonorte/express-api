import express from 'express';
import path from 'path';

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

// not found
app.use(notFoundError);

// error handling
app.use(unhandledError);

app.listen('8080', () => console.log('\nRunning on port 8080\n'));
