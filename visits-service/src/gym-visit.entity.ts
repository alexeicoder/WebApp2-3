import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { User } from './auth/user.entity';  // Подключите вашу сущность User, если она есть

@Entity()
export class GymVisit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string; // Связь с пользователем для индивидуального визита

  @ManyToMany(() => User)  // Связь многие ко многим с пользователями для группового визита
  @JoinTable()  // Таблица для хранения связи
  users: User[];

  @Column({ type: 'timestamp' })
  date: Date;

  @Column()
  duration: number; // Продолжительность в минутах

  @Column({ type: 'varchar', default: 'INDIVIDUAL' })
  type: 'INDIVIDUAL' | 'GROUP';  // Тип визита (индивидуальный или групповой)
}
