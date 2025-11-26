import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    // Normalize email to lowercase for case-insensitive lookup
    const normalizedEmail = email.toLowerCase().trim();
    // Use QueryBuilder with ILIKE for case-insensitive email matching (PostgreSQL)
    return this.repository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = LOWER(:email)', { email: normalizedEmail })
      .getOne();
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.repository.create(user);
    return this.repository.save(newUser);
  }

  async update(id: number, user: Partial<User>): Promise<User> {
    await this.repository.update(id, user);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('User not found after update');
    }
    return updated;
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }
}

