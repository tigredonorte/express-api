import { Token } from '../../../utils/token';
import { IUserInput } from '../user/user.model';
import { AuthModel } from './auth.model';
import { AuthValidatorModel } from './auth.validators';

const authModel = new AuthModel();

export const authResolvers = {
  signup: async (args: { userInput: IUserInput & { confirm_password: string } }) => {
    const validator = new AuthValidatorModel();
    if (!(await validator.isValid(['email', 'confirm_password', 'name', 'password'], args.userInput, false))) {
      throw new Error(JSON.stringify({ message: 'invalid input', status: 422, data: validator.getErrors() }));
    }
    const user = await authModel.signup(args.userInput);
    const token = await authModel.login(args.userInput);
    authModel.signupEmail(args.userInput);

    // @ts-ignore
    return { user: { ...user._doc, _id: user._id?.toString() }, token };
  },

  login: async (args: { userInput: { email: string; password: string } }) => {
    const validator = new AuthValidatorModel();
    if (!(await validator.isValid(['email', 'password'], args.userInput, true))) {
      throw new Error(JSON.stringify({ message: 'invalid input', status: 422, data: validator.getErrors() }));
    }
    const token = await authModel.login(args.userInput);
    const { _id } = Token.getToken(token);
    return { token, userId: _id };
  },
};
