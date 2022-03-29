import express from 'express';
import { errorGuard } from '../../utils/middlewares/route-guard';

import { AuthController } from './auth/auth.controller';
import { AuthValidator } from './auth/auth.validators';

const AuthRoutes = express.Router();
const authController = new AuthController();

// user authentication
AuthRoutes.post('/login', AuthValidator.login, errorGuard(authController.login.bind(authController)));
AuthRoutes.post('/signup', AuthValidator.signup, errorGuard(authController.signup.bind(authController)));
AuthRoutes.post('/reset', AuthValidator.email(false), errorGuard(authController.reset.bind(authController)));
AuthRoutes.post('/reset/:hash', AuthValidator.reset, errorGuard(authController.resetPassword.bind(authController)));
AuthRoutes.post('/checkHash/:hash', AuthValidator.email(false), errorGuard(authController.reset.bind(authController)));
AuthRoutes.get('/logout', errorGuard(authController.logout));

export { AuthRoutes };
