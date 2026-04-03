import { Resend } from 'resend';
import { env } from '../config/env';

export class EmailService {
  private resend: Resend | null = null;

  constructor() {
    if (env.RESEND_API_KEY) {
      this.resend = new Resend(env.RESEND_API_KEY);
    }
  }

  /**
   * Universal send method with "virtual" mode check.
   */
  private async send({
    to,
    subject,
    html,
    text,
  }: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
  }) {
    const toList = Array.isArray(to) ? to : [to];

    if (!env.ENABLE_EMAIL) {
      console.log('============= VIRTUAL EMAIL =============');
      console.log(`To: ${toList.join(', ')}`);
      console.log(`Subject: ${subject}`);
      console.log('-----------------------------------------');
      console.log(text || 'HTML content (check log for full structure)');
      console.log('=========================================');
      return { id: 'virtual_id', virtual: true };
    }

    if (!this.resend) {
      console.error('Resend API Key is missing. Email not sent.');
      return;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: `CakeDay <${env.RESEND_FROM_EMAIL}>`,
        to: toList,
        subject,
        html,
        text,
      });

      if (error) {
        console.error('Resend Error:', error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Email sending failed:', err);
      throw err;
    }
  }

  /**
   * Send verification email after signup.
   */
  async sendVerificationEmail(email: string, name: string, token: string) {
    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;

    return this.send({
      to: email,
      subject: 'CakeDay | E-posta Adresinizi Doğrulayın',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #FF4D8D;">Hoş geldin, ${name}! 🎉</h1>
          <p>CakeDay'e kayıt olduğun için teşekkürler. Hesabını aktifleştirmek için aşağıdaki butona tıklaman yeterli:</p>
          <div style="margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #FF4D8D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              E-postayı Doğrula
            </button>
          </div>
          <p style="color: #666; font-size: 14px;">Eğer düğmeye tıklayamıyorsan bu bağlantıyı tarayıcına yapıştırabilirsin:</p>
          <p style="color: #999; font-size: 12px; word-break: break-all;">${verificationUrl}</p>
        </div>
      `,
      text: `Merhaba ${name}, CakeDay'e hoş geldin! Hesabını doğrulamak için tıkla: ${verificationUrl}`,
    });
  }

  /**
   * Send password reset email.
   */
  async sendPasswordResetEmail(email: string, resetUrl: string) {
    return this.send({
      to: email,
      subject: 'CakeDay | Şifre Sıfırlama İsteği',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Şifre Sıfırlama</h2>
          <p>Hesabın için şifre sıfırlama isteği aldık. Yeni şifreni belirlemek için aşağıdaki butona tıkla:</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #FF4D8D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Şifremi Sıfırla
            </a>
          </div>
          <p>Eğer bu isteği sen yapmadıysan bu e-postayı görmezden gelebilirsin.</p>
        </div>
      `,
      text: `Şifreni sıfırlamak için şu bağlantıyı kullan: ${resetUrl}`,
    });
  }
}

export const emailService = new EmailService();
