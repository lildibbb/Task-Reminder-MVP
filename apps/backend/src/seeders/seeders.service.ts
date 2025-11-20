import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../users/entities/user.entity';
import { UserType } from '../users/enums/user-type';
import { UserRoleEntity } from '../user-roles/entities/user-role.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class SeedersService {
  private readonly logger = new Logger(SeedersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepository: Repository<UserRoleEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly rolesService: RolesService,
  ) {}

  async seed() {
    this.logger.log('Starting database seeding process...');
    await this.seedRoles();
    await this.seedAdmin();
    this.logger.log('Database seeding completed.');
  }

  async seedRoles() {
    this.logger.log('Seeding roles...');

    const rolesToSeed = [
      {
        name: UserType.ADMIN,
        description: 'Administrator role with full access',
      },
      {
        name: UserType.USER,
        description: 'Regular user role with limited access',
      },
    ];

    const results = {};

    for (const roleData of rolesToSeed) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (existingRole) {
        this.logger.log(`Role "${roleData.name}" already exists. Skipping.`);
        results[roleData.name] = existingRole;
      } else {
        const newRole = this.roleRepository.create(roleData);
        await this.roleRepository.save(newRole);
        this.logger.log(`Role "${roleData.name}" created successfully.`);
        results[roleData.name] = newRole;
      }
    }

    return results;
  }

  async seedAdmin() {
    this.logger.log('Seeding admin user...');
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'P@ssw2rd';
    const adminUsername = process.env.INITIAL_ADMIN_USERNAME || 'admin';

    const existingAdmin = await this.userRepository.findOne({
      where: [{ email: ILike(adminEmail) }, { username: ILike(adminUsername) }],
    });

    if (existingAdmin) {
      this.logger.log(
        `Admin user with email "${adminEmail}" or username "${adminUsername}" already exists. Skipping seed.`,
      );
      return;
    }

    const adminUserEntity = this.userRepository.create({
      email: adminEmail,
      password: adminPassword,
      name: 'Admin',
      username: adminUsername,
    });

    let savedAdminUser: UserEntity;
    try {
      savedAdminUser = await this.userRepository.save(adminUserEntity);
      this.logger.log(
        `Admin user ${adminEmail} (username: ${adminUsername}) created with ID: ${savedAdminUser.id}.`,
      );
    } catch (error) {
      this.logger.error(
        `Error saving new admin user ${adminEmail} (username: ${adminUsername}):`,
        error,
      );

      throw error;
    }

    const adminRole = await this.rolesService.findRoleIDByName(UserType.ADMIN);

    if (!adminRole || !adminRole.id) {
      this.logger.error(
        `FATAL: ADMIN role (type: ${UserType.ADMIN}) not found. Cannot assign role to admin user.`,
      );
      throw new NotFoundException(
        `ADMIN role not found. Seeding admin user failed.`,
      );
    }
    this.logger.debug(
      `Found ADMIN role: ID=${adminRole.id}, Name=${adminRole.name}`,
    );

    const existingUserRole = await this.userRoleRepository.findOne({
      where: { userId: savedAdminUser.id, roleId: adminRole.id },
    });

    if (existingUserRole) {
      this.logger.log(
        `Admin user ${adminEmail} already has the ADMIN role. Skipping role assignment.`,
      );
    } else {
      const adminUserRole = this.userRoleRepository.create({
        userId: savedAdminUser.id,
        roleId: adminRole.id,
      });
      try {
        await this.userRoleRepository.save(adminUserRole);
        this.logger.log(
          `Admin user ${adminEmail} successfully assigned ADMIN role.`,
        );
      } catch (error) {
        this.logger.error(
          `Error assigning ADMIN role to user ${adminEmail}:`,
          error,
        );
        throw error;
      }
    }
  }
}
