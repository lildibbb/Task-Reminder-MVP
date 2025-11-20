import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoleEntity } from './entities/user-role.entity';
import { Repository } from 'typeorm';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepository: Repository<UserRoleEntity>,
  ) {}

  async create(createUserRoleDto: CreateUserRoleDto) {
    return await this.userRoleRepository.save(
      this.userRoleRepository.create(createUserRoleDto),
    );
  }
  async update(updateUserRoleDto: UpdateUserRoleDto, userRoleId: number) {
    return await this.userRoleRepository.update(userRoleId, updateUserRoleDto);
  }
  findOneById(id: number) {
    return this.userRoleRepository.findOne({ where: { id } });
  }
  findOneByUserIdAndRoleId(userId: number, roleId: number) {
    return this.userRoleRepository.findOne({
      where: { userId: userId, roleId: roleId },
    });
  }
}
