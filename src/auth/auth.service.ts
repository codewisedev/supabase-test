import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { supabase } from '../config/supabase';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

@Injectable()
export class AuthService {
  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'customer',
        },
      },
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message: 'Registration successful',
      user: data.user,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return {
      message: 'Login successful',
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
      user: data.user,
    };
  }

  async logout(authHeader: string) {
    try {
      const token = authHeader.split(' ')[1];

      const { error } = await supabase.auth.admin.signOut(token);

      if (error) {
        throw new BadRequestException(error.message);
      }

      return {
        message: 'Logout successful',
      };
    } catch (error) {
      await supabase.auth.signOut();
      return {
        message: 'Logout successful',
      };
    }
  }

  async getProfile(user) {
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      user,
    };
  }
}
