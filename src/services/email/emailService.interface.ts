import { SESClient } from "@aws-sdk/client-ses";

export interface EmailService {
    sendVerificationEmail(to: string, code: string): Promise<boolean>;
}

export interface EmailServiceDependencies {
    sesClient: SESClient;
    source: string;
}

