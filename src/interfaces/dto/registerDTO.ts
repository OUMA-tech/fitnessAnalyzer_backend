export interface RegisterDTO {
    username: string;
    email: string;
    password: string;
    verificationCode: string;
    type: 'verification';
}
