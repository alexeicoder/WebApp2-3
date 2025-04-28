import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const userExists = await this.userRepository.findOne({ 
      where: { email: registerDto.email } 
    });
    if (userExists) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      role: registerDto.role || 'client',
    });

    await this.userRepository.save(user);
    return this.generateToken(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({ 
      where: { email: loginDto.email } 
    });
    
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Неверные учетные данные');
    }
  
    const token = await this.generateToken(user);
    
    return {
      access_token: token,
      user: {
        role: user.role,
        email: user.email,
      }
    };
  }

  private generateToken(user: User) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role 
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  getProfile(user: any) {
    return {
      email: user.email,
      role: user.role,
    };
  }

  async getAllUsers() {
    const users = await this.userRepository.find();
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
    }));
  }
  async updateUser(userId: string, updates: { email?: string; role?: string }) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');
  
    if (updates.email) {
      user.email = updates.email;
    }
  
    if (updates.role) {
      if (updates.role !== 'client' && updates.role !== 'admin') {
        throw new Error('Invalid role. Allowed roles: client or admin');
      }
      user.role = updates.role as 'client' | 'admin';
    }
  
    return this.userRepository.save(user);
  }
  
}