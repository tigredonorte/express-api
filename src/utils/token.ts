import jwt from 'jsonwebtoken';

export class Token {
  static sign(data: any, expiresIn: string): string {
    return jwt.sign(data, process.env.SECRET || 'default', {
      expiresIn,
    });
  }

  static getToken(token: string): any {
    try {
      return jwt.verify(token, process.env.SECRET || 'default');
    } catch (err) {
      return false;
    }
  }
}
