import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { VisitsRepository } from './visits.repository';
import { GymVisit } from './gym-visit.entity';
import { VisitType } from './visit-type.enum';

@Injectable()
export class AppService {
  constructor(private readonly repo: VisitsRepository) {}

  async create(userId: string, data: Omit<GymVisit, 'id' | 'userId'>) {
    if (new Date(data.date) > new Date()) {
      throw new BadRequestException('Дата визита не может быть в будущем');
    }
    return this.repo.create({ ...data, userId });
  }

  async getByUser(userId: string) {
    return this.repo.findByUserId(userId);
  }

  async delete(userId: string, id: string) {
    return this.repo.delete(id, userId);
  }
  async updateVisit(
    user: { userId: string; role: string },
    visitId: string,
    updates: { date?: string; duration?: number; type?: VisitType }
  ) {
    const visit = await this.repo.findOne({
      where: { id: visitId },
      relations: ['users']
    });
  
    if (!visit) throw new Error('Visit not found');
  
    const isOwner = visit.users.some(u => u.id === user.userId);
    if (!isOwner && user.role !== 'admin') {
      throw new ForbiddenException('Access denied');
    }
  
    if (updates.date) visit.date = new Date(updates.date);
    if (updates.duration) visit.duration = updates.duration;
    if (updates.type) visit.type = updates.type;
  
    return this.repo.save(visit);
  }
  
}