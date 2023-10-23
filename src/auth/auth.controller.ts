import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { VerificationDto } from './dto/verify.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from 'src/email/email.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private emailService: EmailService,
  ) {}

  @Post('/signup')
  async signup(@Body() signUpDto: SignUpDto): Promise<any> {
    try {
      const { user, token } = await this.authService.signUp(signUpDto);

      const otp = await this.authService.generateAndSaveOTP(user.email);

      await this.emailService.sendEmail(
        user.email,
        `Welcome ${user.name} to GG!`,
        otp,
      );

      user.otp = otp;

      return {
        status: 201,
        success: true,
        token,
        user,
      };
    } catch (error) {
      return {
        status: error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message || 'Something went wrong',
      };
    }
  }

  @Post('/login')
  async login(@Body() loginDto: LoginDto): Promise<any> {
    try {
      const { user, token } = await this.authService.login(loginDto);

      return {
        status: 200,
        success: true,
        token,
        user,
      };
    } catch (error) {
      return {
        status: error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message || 'Something went wrong',
      };
    }
  }

  @Post('/verify')
  async verifyOtp(@Body() verificationDto: VerificationDto): Promise<any> {
    const { otp } = verificationDto;
    try {
      const user = await this.authService.verifyOtp(otp);

      return {
        status: 200,
        success: true,
        user,
      };
    } catch (error) {
      return {
        status: error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message || 'Something went wrong',
      };
    }
  }

  @Post('/forgotpassword')
  async forgotPassword(@Body() forgotDto: ForgotPasswordDto): Promise<any> {
    const { email } = forgotDto;

    try {
      const user = await this.authService.forgotPassword(email);

      const otp = await this.authService.generateAndSaveOTP(email);

      await this.emailService.sendEmail(
        user.email,
        'Password Reset Request',
        otp,
      );

      return {
        status: 200,
        message:
          'Password reset email sent successfully. Please check your email inbox.',
      };
    } catch (error) {
      return {
        status: error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message || 'Something went wrong',
      };
    }
  }

  @Post('/resetpassword')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<any> {
    try {
      await this.authService.resetPassword(resetPasswordDto);

      return {
        status: 200,
        message: 'Password reset successful',
      };
    } catch (error) {
      return {
        status: error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message || 'Something went wrong',
      };
    }
  }
}
