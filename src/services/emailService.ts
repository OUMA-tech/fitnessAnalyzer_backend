import { 
  SESClient, 
  SendEmailCommand,
  SendEmailCommandInput 
} from "@aws-sdk/client-ses";

// 创建 SES 客户端
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'ap-southeast-2', // 使用你的 AWS 区域
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

// 发件人邮箱（需要在 AWS SES 中验证的域名）
const SENDER_EMAIL = `noreply@${process.env.DOMAIN_NAME}`;

export const sendVerificationEmail = async (to: string, code: string): Promise<boolean> => {
  try {
    const params: SendEmailCommandInput = {
      Source: SENDER_EMAIL,
      Destination: {
        ToAddresses: [to]
      },
      Message: {
        Subject: {
          Data: 'Verification Code - Fit Trackr',
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: `
              <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
                  <h2 style="color: #333; margin-bottom: 20px;">Welcome to Fit Trackr!</h2>
                  <p style="color: #666; font-size: 16px;">Your verification code is:</p>
                  <div style="background-color: #4CAF50; color: white; font-size: 32px; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                    ${code}
                  </div>
                  <p style="color: #666; font-size: 14px;">The code will be valid for 15 minutes.</p>
                  <p style="color: #666; font-size: 14px;">If this was not you, please ignore this email.</p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                  <p style="color: #999; font-size: 12px;">This email is automatically sent by the system, please do not reply.</p>
                </div>
              </div>
            `,
            Charset: 'UTF-8'
          }
        }
      }
    };

    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}; 