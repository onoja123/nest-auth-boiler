import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { VerificationDto } from './dto/verify.dto';
import { generateOTP } from 'src/utils/otp-gen';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,
        private jwtService: JwtService
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
            throw new UnauthorizedException('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const token = this.jwtService.sign({ id: user.id });

        return { user, token };
    }
    async generateAndSaveOTP(email: string): Promise<string> {
        const otp = await generateOTP(); // Ensure the generateOTP function returns a string directly
        const user = await this.userModel.findOne({ email: email });
    
        if (!user) {
            throw new NotFoundException(`User ${email} not found`);
        }
    
        user.otp = otp;
        await user.save();
    
        return otp;
    }
    

    async verifyOtp(email: string, otp: string): Promise<any> {
        const user = await this.userModel.findOne({ email: email });

        if (!user) {
            throw new UnauthorizedException('Invalid email');
        }

        if (!user.otp || user.otp !== otp) {
            throw new UnauthorizedException('Invalid OTP');
        }

        user.isActive = true;
        user.otp = null;

        await user.save();
    }

    async forgotPassword(email: string): Promise<User> {
        const user = await this.userModel.findOne({ email: email });

        if (!user) {
            throw new NotFoundException(`User ${email} not found`);
        }

        return user;
    }

    async resetPassword(email: string, otp: string, newPassword: string): Promise<any> {
        const user = await this.userModel.findOne({ email: email });

        if (!user || user.otp !== otp) {
            throw new UnauthorizedException('Invalid OTP');
        }

        user.password = await bcrypt.hash(newPassword, 12);
        user.otp = null;

        await user.save();
    }
}
