import { 
  SendEmailCommand,
  SendEmailCommandInput 
} from "@aws-sdk/client-ses";
import { EmailService, EmailServiceDependencies } from "./emailService.interface";


export const createEmailService = (dependencies: EmailServiceDependencies): EmailService => {
  const { sesClient, source } = dependencies;

  return {
    sendVerificationEmail: async (to: string, code: string): Promise<boolean> => {
      try {
        const params: SendEmailCommandInput = {
          Source: source,
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
    }
  }
};
