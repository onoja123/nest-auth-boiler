import { IsNotEmpty, IsString } from 'class-validator';

export class VerificationDto {
  @IsNotEmpty()
  @IsString()
  otp: string;
}
