import { IsEmail, IsEmpty } from 'class-validator';

export class VerificationDto {
  @IsEmpty()
  otp: string;

  @IsEmail()
  email: string;
}
