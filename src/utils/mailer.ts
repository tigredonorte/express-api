import sgMail from '@sendgrid/mail';

export class Mailer {
  private static started = false;
  static async send(msg: { to: string; subject: string; text?: string; html: string }) {
    try {
      if (!Mailer.started) {
        Mailer.init();
      }
      await sgMail.send({
        ...msg,
        from: process.env.SENDGRID_EMAIL ?? '',
      });
    } catch (error: any) {
      const err = error.response ? error.response.body : error;
      console.error(err);
      throw new Error(err);
    }
  }

  private static init() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('Invalid Sendgrid API key');
    }
    sgMail.setApiKey(apiKey);
    Mailer.started = true;
  }
}
