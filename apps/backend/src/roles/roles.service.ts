import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleEntity } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const role = await this.findRoleIDByName(createRoleDto.name);
    if (role) {
      throw new UnprocessableEntityException('Role already exists');
    }

    return this.roleRepository.save(this.roleRepository.create(createRoleDto));
  }
  findRoleIDByName(name: string) {
    return this.roleRepository.findOne({
      where: { name: ILike(name) },
      select: ['id'],
    });
  }
  findRoleByID(id: number) {
    return this.roleRepository.findOne({ where: { id } }).then((result) => {
      if (!result) {
        throw new NotFoundException('Role not found');
      }
      return result;
    });
  }

  async update(id: number, updateRoleDto: CreateRoleDto) {
    const role = await this.findRoleIDByName(updateRoleDto.name);
    if (role && Number(role.id) !== id) {
      throw new UnprocessableEntityException('Role name already exists');
    }else if (role && Number(role.id) === id) {
      if(role.deletedAt) {
        await this.roleRepository.restore(role.id);
      }
      await this.roleRepository.update(id, updateRoleDto);
    }

    return this.roleRepository.findOneBy({ id });
  }

  async getAll() {
    return this.roleRepository.find();
  }

  async delete(id: number) {
    await this.findRoleByID(id);
    return this.roleRepository.softDelete({ id: id });
  }
}
