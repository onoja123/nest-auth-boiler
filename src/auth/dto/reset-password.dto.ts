import { IsEmail, IsEmpty } from 'class-validator';

export class ResetPasswordDto {
  @IsEmpty()
  otp: string;

  @IsEmail()
  email: string;

  @IsEmpty()
  newPassword: string;
}
