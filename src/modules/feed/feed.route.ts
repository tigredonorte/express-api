import express from 'express';

import { errorGuard } from '../../utils/middlewares/route-guard';
import { FeedController } from './feed/feed.controller';
import { FeedValidator } from './feed/feed.validator';

const FeedRoutes = express.Router();
const controller = new FeedController();

// feed crud
FeedRoutes.get('/posts', errorGuard(controller.list.bind(controller)));
FeedRoutes.get('/posts/:id', errorGuard(controller.get.bind(controller)));
FeedRoutes.post('/', FeedValidator.valid(false), errorGuard(controller.add.bind(controller)));
FeedRoutes.patch('/:id', FeedValidator.valid(true), errorGuard(controller.edit.bind(controller)));
FeedRoutes.delete('/:id', errorGuard(controller.delete.bind(controller)));

export { FeedRoutes };
