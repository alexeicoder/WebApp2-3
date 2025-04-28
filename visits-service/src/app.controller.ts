import { Controller, Post, Get, Delete, Body, Param, UseGuards, Req, ForbiddenException, Patch } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { GymVisit } from './gym-visit.entity';
import { VisitType } from './visit-type.enum';
import { User } from './auth/user.entity';
@ApiTags('Управление посещениями спортзала')
@ApiBearerAuth()
@Controller('visits')
@UseGuards(AuthGuard('jwt'))
export class AppController {
  constructor(private readonly service: AppService) {}

  /* ========== СОЗДАНИЕ ПОСЕЩЕНИЯ ========== */
  @Post()
  @ApiOperation({ 
    summary: 'Создать новое посещение',
    description: 'Добавляет запись о посещении спортзала для текущего пользователя (групповое или индивидуальное)'
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['date', 'duration', 'type'],
      properties: {
        date: { type: 'string', format: 'date-time' },
        duration: { type: 'number' },
        type: {
          type: 'string',
          enum: ['GROUP', 'INDIVIDUAL'],
          description: 'Тип посещения'
        }
      },
      example: {
        date: '2025-04-02T14:00:00Z',
        duration: 90,
        type: 'GROUP'
      }
    }
  })
  async createVisit(
    @Req() req: Request,
    @Body() visitData: { date: string; duration: number; type: VisitType }
  ) {
    const userId = (req.user as { userId: string }).userId;
  
    const visit: Omit<GymVisit, 'id' | 'userId'> = {
      date: new Date(visitData.date),
      duration: visitData.duration,
      type: visitData.type,
      users: [{ id: userId } as User], // <-- добавили пользователя
    };
  
    return this.service.create(userId, visit);
  }
  

  /* ========== ОТЛАДОЧНЫЙ ЭНДПОИНТ ========== */
  @Get('debug-request')
  @ApiOperation({
    summary: 'Отладочная информация о запросе',
    description: 'Возвращает полную информацию о текущем запросе для отладки'
  })
  @ApiResponse({
    status: 200,
    description: 'Отладочная информация',
    schema: {
      example: {
        timestamp: '2025-04-03T14:25:00.000Z',
        method: 'GET',
        url: '/visits/debug-request',
        user: {
          userId: '45953a8d-47e6-4a18-880d-3a6f370077f4'
        }
      }
    }
  })
  debugRequest(@Req() req: Request) {
    return {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      user: req.user
    };
  }

  /* ========== ПОЛУЧЕНИЕ ПОСЕЩЕНИЙ ПОЛЬЗОВАТЕЛЯ ========== */
  @Get()
  @ApiOperation({ 
    summary: 'Получить все посещения пользователя',
    description: 'Возвращает список всех посещений для текущего авторизованного пользователя'
  })
  @ApiResponse({
    status: 200,
    description: 'Список посещений',
    schema: {
      example: [{
        id: '550e8400-e29b-41d4-a716-446655440000',
        userId: '45953a8d-47e6-4a18-880d-3a6f370077f4',
        date: '2025-04-01T09:30:00Z',
        duration: 30
      }]
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Требуется авторизация: неверный или отсутствующий токен' 
  })
  async getVisits(@Req() req: Request) {
    return this.service.getByUser((req.user as { userId: string }).userId);
  }

  /* ========== УДАЛЕНИЕ ПОСЕЩЕНИЯ ========== */
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Удалить посещение',
    description: 'Удаляет конкретное посещение по ID. Пользователь может удалять только свои посещения.'
  })
  @ApiParam({
    name: 'id',
    description: 'UUID посещения для удаления',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Посещение успешно удалено',
    schema: {
      example: { message: 'Посещение удалено успешно' }
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Запрещено: попытка удалить чужое посещение' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Не найдено: посещение с указанным ID не существует' 
  })
  async deleteVisit(
    @Req() req: Request,
    @Param('id') visitId: string
  ) {
    return this.service.delete((req.user as { userId: string }).userId, visitId);
  }
  @Get('/admin/users/:id/visits')
@ApiOperation({ summary: 'Получить все посещения по ID пользователя (только для админа)' })
@ApiParam({ name: 'id', description: 'UUID пользователя' })
async getVisitsForUser(@Req() req: Request, @Param('id') userId: string) {
  const user = req.user as any;
  if (user.role !== 'admin') {
    throw new ForbiddenException('Access denied');
  }
  return this.service.getByUser(userId);
}
@Post('/admin/users/:id/visits')
@ApiOperation({ summary: 'Создать посещение для пользователя по ID (только для админа)' })
@ApiParam({ name: 'id', description: 'UUID пользователя' })
@ApiBody({
  schema: {
    type: 'object',
    required: ['date', 'duration', 'type'],
    properties: {
      date: { type: 'string', format: 'date-time' },
      duration: { type: 'number' },
      type: { type: 'string', enum: ['GROUP', 'INDIVIDUAL'] }
    },
    example: {
      date: '2025-04-11T10:00:00Z',
      duration: 60,
      type: 'GROUP'
    }
  }
})
async createVisitForUser(
  @Req() req: Request,
  @Param('id') userId: string,
  @Body() visitData: { date: string; duration: number; type: VisitType }
) {
  const user = req.user as any;
  if (user.role !== 'admin') {
    throw new ForbiddenException('Access denied');
  }

  const visit: Omit<GymVisit, 'id' | 'userId'> = {
    date: new Date(visitData.date),
    duration: visitData.duration,
    type: visitData.type,
    users: [{ id: userId } as User],
  };

  return this.service.create(userId, visit);
}
@Patch(':id')
@ApiOperation({ summary: 'Обновить посещение по ID (для админа и владельца)' })
@ApiParam({ name: 'id', description: 'UUID посещения' })
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      date: { type: 'string', format: 'date-time' },
      duration: { type: 'number' },
      type: { type: 'string', enum: ['GROUP', 'INDIVIDUAL'] }
    },
    example: {
      date: '2025-04-12T15:00:00Z',
      duration: 75,
      type: 'INDIVIDUAL'
    }
  }
})
async updateVisit(
  @Req() req: Request,
  @Param('id') visitId: string,
  @Body() updates: { date?: string; duration?: number; type?: VisitType }
) {
  return this.service.updateVisit((req.user as any), visitId, updates);
}


}