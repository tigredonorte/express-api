import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

import { Mailer } from '../../../utils/mailer';
import { Token } from '../../../utils/token';
import { IUser, User, UsersModel } from '../user/user.model';

export class AuthModel {
  private static usersModel = new UsersModel();

  async login(user: { email: string; password: string }): Promise<string> {
    const foundUser = await User.findOne({ email: user.email });
    if (!foundUser) {
      throw new Error('email or password incorrect');
    }

    const password_valid = await bcrypt.compare(user.password, foundUser.password);
    if (!password_valid) {
      throw new Error('email or password incorrect');
    }
    return Token.sign(
      {
        _id: foundUser._id?.toString(),
        email: foundUser.email,
        name: foundUser.name,
      },
      process.env.TOKEN_PERIOD || '2h'
    );
  }

  async signup(user: IUser): Promise<IUser> {
    return await AuthModel.usersModel.add(user);
  }

  async signupEmail(user: IUser): Promise<void> {
    await Mailer.send({
      to: user.email,
      subject: 'Signup succeeded!',
      html: `Hi ${user.name}, <br/><br/> You successfully signed up!`,
    });
  }

  async reset(email: string): Promise<void> {
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      throw new Error('Email not found');
    }

    const dt = new Date();
    dt.setHours(dt.getHours() + 2);
    foundUser.recoverHash = nanoid(48);
    foundUser.recoverDate = dt;
    await foundUser.save();
    const url = `http://localhost:3000/auth/reset/${foundUser.recoverHash}`;
    await Mailer.send({
      to: email,
      subject: 'Recover password',
      html: `
      Hi ${foundUser.name}, <br>

      Someone is trying to recover your password. If it's not you, just ignore this email. <br><br>

      If it's your
      <a href='${url}'>click here</a>
      to recover your account access <hr>

      If your browser is not displaying the link above, past it on your browser:
      http://localhost:3000/auth/changePassword/${url}`,
    });
  }

  async checkHashToRecoverPassword(recoverHash: string) {
    const user = await User.findOne({ recoverHash });
    if (!user || !user.recoverDate) {
      throw new Error('Token expired! Please, try to recover again!');
    }

    if (new Date() > user.recoverDate) {
      user.recoverDate = undefined;
      user.recoverHash = undefined;
      await user.save();
      throw new Error('Token expired! Please, try to recover again!');
    }

    return user;
  }

  async resetPassword(recoverHash: string, data: { password: string; }) {
    const user = await this.checkHashToRecoverPassword(recoverHash);
    user.password = await AuthModel.usersModel.encryptPassword(data.password);
    user.recoverDate = undefined;
    user.recoverHash = undefined;
    await user.save();

    Mailer.send({
      to: user.email,
      subject: 'Recover password',
      html: `
      Hi ${user.name}, <br>

      Your password has been redefined. <br>
      If you done this action just ignore this email.<br><br>

      If it wasn't you
      <a href='http://localhost:3000/auth/reset?email=${user.email}'>click here</a>
      to recover your password`,
    });
  }
}
