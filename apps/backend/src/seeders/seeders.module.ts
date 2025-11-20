import { Module } from '@nestjs/common';
import { SeedersService } from './seeders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { RolesModule } from '../roles/roles.module';
import { RoleEntity } from '../roles/entities/role.entity';
import { UserRoleEntity } from '../user-roles/entities/user-role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserRoleEntity, RoleEntity]),
    RolesModule,
  ],
  providers: [SeedersService],
  exports: [SeedersService],
})
export class SeedersModule {}
