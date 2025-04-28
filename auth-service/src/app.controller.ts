import { Controller, Post, Body, Get, Param, Put, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';

@ApiTags('Auth')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered' })
  register(@Body() registerDto: RegisterDto) {
    return this.appService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'JWT token, данные пользователя' })
  login(@Body() loginDto: LoginDto) {
    return this.appService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Req() req: Request) {
    return this.appService.getProfile(req.user);
  }

  @Get('admin/users')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (admin only)' })
  async getAllUsers(@Req() req: Request) {
    const user = req.user as any;
    if (user.role !== 'admin') {
      throw new ForbiddenException('Access denied');
    }
    return this.appService.getAllUsers();
  }
  @Put('admin/users/:id')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@ApiOperation({ summary: 'Update user by ID (admin only)' })
@ApiParam({ name: 'id', description: 'ID пользователя для обновления' })
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      role: { type: 'string', enum: ['user', 'admin'] }
    },
    example: {
      email: 'updated@email.com',
      role: 'user'
    }
  }
})
async updateUser(@Req() req: Request, @Param('id') id: string, @Body() body: { email?: string; role?: string }) {
  const user = req.user as any;
  if (user.role !== 'admin') {
    throw new ForbiddenException('Access denied');
  }
  return this.appService.updateUser(id, body);
}
}