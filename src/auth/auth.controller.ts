import { 
    Body, 
    Controller ,
    InternalServerErrorException,
    NotFoundException,
    Post,
    Req,
    Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { sendConfirmationEmail } from 'src/utils/send-email';
import { LoginDto } from './dto/login.dto';
import { VerificationDto } from './dto/verify.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from 'src/email/email.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private emailService: EmailService) {}

  @Post('/signup')
  async signup(@Body() signUpDto: SignUpDto): Promise<any> {
    try {
      const { user, token } = await this.authService.signUp(signUpDto);
  
      const otp = await this.authService.generateAndSaveOTP(user.email);
  
      await this.emailService.sendEmail(user.email, `Welcome ${user.name} to GG!`, otp);
  
      return {
        status: 201,
        success: true,
        token,
        user,
      };
    } catch (error) {
      console.error('Error during sign-up:', error);
      return {
        status: 500,
        success: false,
        message: 'Something went wrong',
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
      console.error('Error during login:', error);
      return {
        status: 500,
        success: false,
        message: 'Something went wrong',
      };
    }
  }

  @Post('/verify')
  async verifyOtp(@Body() verifyDto: VerificationDto): Promise<any> {
    try {
      const data = await this.authService.verifyOtp(verifyDto.email, verifyDto.otp);

      if (!data) {
        return {
          message: 'Invalid OTP',
        };
      }

      return {
        status: 200,
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error during OTP verification:', error);
      return {
        status: 500,
        success: false,
        message: 'Something went wrong',
      };
    }
  }

  @Post('/forgotpassword')
  async forgotPassword(@Body() forgotDto: ForgotPasswordDto): Promise<any> {
    const { email } = forgotDto;

    try {
      const user = await this.authService.forgotPassword(email);

      const otp = await this.authService.generateAndSaveOTP(email);

      await this.emailService.sendEmail(user.email, 'Password Reset Request', otp);

      return {
        status: 200,
        message: 'Password reset email sent successfully. Please check your email inbox.',
      };
    } catch (error) {
      console.error('Error sending reset password email', error);
      return {
        status: 500,
        success: false,
        message: 'An error occurred, please try again',
      };
    }
  }

  @Post('/reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<any> {
    const { email, otp, newPassword } = resetPasswordDto;

    try {
      const isResetSuccessful = await this.authService.resetPassword(email, otp, newPassword);

      if (!isResetSuccessful) {
        return {
          message: 'User not found or invalid OTP',
        };
      }

      return {
        status: 200,
        message: 'Password reset successful',
      };
    } catch (error) {
      console.error('Error during password reset:', error);
      return {
        status: 500,
        success: false,
        message: 'An error occurred during password reset',
      };
    }
  }
}

