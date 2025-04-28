import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ 
    example: 'client', 
    enum: ['client', 'admin'],
    required: false 
  })
  @IsOptional()
  @IsIn(['client', 'admin'])
  role?: 'client' | 'admin';
}