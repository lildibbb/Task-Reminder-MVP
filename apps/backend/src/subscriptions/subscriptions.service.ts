import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { SubscriptionEntity } from './entities/subscription.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUpdateSubscriptionDto } from './dto/create-update-subscription.dto';
import { instanceToPlain } from 'class-transformer';
@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionsRepository: Repository<SubscriptionEntity>,
  ) {}

   findOneByUserId(userId: number) {
    return this.subscriptionsRepository.findOne({
      where: { userId },
      withDeleted: true,
      relations: ['user'],
    });
  }
  findOneActiveByUserId(userId: number) {
    return this.subscriptionsRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  async createOrUpdate(userId: number, createSubscriptionDto: CreateUpdateSubscriptionDto) {
    const existingSubscription = await this.findOneByUserId(
      userId
    );

    if (existingSubscription) {
      if (existingSubscription.deletedAt) {
        await this.subscriptionsRepository.restore(existingSubscription.id);
      }
      return await this.update(userId,createSubscriptionDto);
    }
    else {
      return await this.subscriptionsRepository.save(
        this.subscriptionsRepository.create({
         userId,
          subscription: instanceToPlain(createSubscriptionDto.subscription),
        }),
      );
    }
  }

  async update(userId: number,updateSubscriptionDto: CreateUpdateSubscriptionDto) {
    const subs = await this.findOneByUserId(userId);
    if (!subs) {
      throw new NotFoundException('Subscription not found');
    }


    await this.subscriptionsRepository.update(subs.id, {
      subscription: instanceToPlain(updateSubscriptionDto.subscription),
    });

    return this.subscriptionsRepository.findOne({
      where: { id: subs.id },
    });
  }

  async delete(userId: number) {
    const subs = await this.findOneByUserId(userId);
    if (!subs) {
      throw new NotFoundException('Subscription not found');
    }
    return this.subscriptionsRepository.softDelete({ id: subs.id });
  }
}
