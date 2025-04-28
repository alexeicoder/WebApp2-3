import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { GymVisit } from './gym-visit.entity';

@Injectable()
export class VisitsRepository {
  constructor(
    @InjectRepository(GymVisit)
    private readonly repo: Repository<GymVisit>,
  ) {}

  async create(data: Omit<GymVisit, 'id'>): Promise<GymVisit> {
    const visit = this.repo.create(data);
    
    return this.repo.save(visit);
  }

  async findByUserId(userId: string): Promise<GymVisit[]> {
    return this.repo.find({ where: { userId }, order: { date: 'DESC' } });
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.repo.delete({ id, userId });
  }
  async findOne(options: FindOneOptions<GymVisit>): Promise<GymVisit | null> {
    return this.repo.findOne(options);
  }

  async save(visit: GymVisit): Promise<GymVisit> {
    return this.repo.save(visit);
  }
}