import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import AppError from '../utils/error';
import { generateOTP } from 'src/utils/otp-gen';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<{
    user: User;
    token: string;
  }> {
    const { name, email, password } = signUpDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = this.jwtService.sign({ id: user.id });

    return { user, token };
  }

  async login(loginDto: LoginDto): Promise<{
    user: User;
    token: string;
  }> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email: email });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.jwtService.sign({ id: user.id });

    return { user, token };
  }
  async generateAndSaveOTP(email: string): Promise<string> {
    const otp = await generateOTP();
    const user = await this.userModel.findOne({ email: email });

    if (!user) {
      throw new NotFoundException(`User ${email} not found`);
    }

    user.otp = otp;
    user.otpCreatedAt = new Date();
    await user.save();

    return otp;
  }

  async verifyOtp(otp: string): Promise<User> {
    const user = await this.userModel.findOne({ otp });

    if (!user) {
      throw new AppError('Invalid OTP or OTP has expired', 401);
    }
    // Check if the OTP has expired (10 minutes)
    const otpExpirationTime = new Date(
      user.otpCreatedAt.getTime() + 10 * 60 * 1000,
    );
    if (new Date() > otpExpirationTime) {
      throw new UnauthorizedException('OTP has expired');
    }

    if (!user.otp || user.otp !== otp) {
      throw new AppError('Invalid OTP or OTP has expired', 401);
    }

    if (user.isActive) {
      throw new AppError('User is already verified', 401);
    }

    user.isActive = true;
    user.otp = null;
    await user.save();

    return user;
  }

  async forgotPassword(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email: email });

    if (!user) {
      throw new NotFoundException(`User ${email} not found`);
    }

    return user;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { otp, newPassword, confirmPassword } = resetPasswordDto;

    // Check if the passwords match
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Retrieve the user based on the OTP
    const user = await this.userModel.findOne({ otp });

    if (!user) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Update the user's password and save changes
    user.password = await bcrypt.hash(newPassword, 12);
    user.otp = null;
    await user.save();
  }
}
