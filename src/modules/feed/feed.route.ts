import express from 'express';

import { errorGuard } from '../../utils/middlewares/route-guard';
import { FeedController } from './feed/feed.controller';
import { FeedValidator } from './feed/feed.validator';
import { StatusController } from './status/status.controller';
import { StatusValidator } from './status/status.validator';

const FeedRoutes = express.Router();

// posts crud
const feedController = new FeedController();
FeedRoutes.get('/posts', errorGuard(feedController.list.bind(feedController)));
FeedRoutes.get('/posts/:id', errorGuard(feedController.get.bind(feedController)));
FeedRoutes.post('/posts', FeedValidator.valid(false), errorGuard(feedController.add.bind(feedController)));
FeedRoutes.patch('/posts/:id', FeedValidator.valid(true), errorGuard(feedController.edit.bind(feedController)));
FeedRoutes.delete('/posts/:id', errorGuard(feedController.delete.bind(feedController)));

// user status
const statusController = new StatusController();
FeedRoutes.put('/status', StatusValidator.valid, errorGuard(statusController.set.bind(statusController)));
FeedRoutes.get('/status', errorGuard(statusController.get.bind(statusController)));

export { FeedRoutes };
