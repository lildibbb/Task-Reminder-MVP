import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosInstance } from 'axios';
import { Cache } from 'cache-manager';
import ms from 'enhanced-ms';
import { ErrorFormat } from 'src/helper/validation';
import { DeepPartial, ILike, Repository } from 'typeorm';
import { RolesService } from '../roles/roles.service';
import { CreateUserDto } from './dto/create-user.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { UserEntity } from './entities/user.entity';
import { UserRolesService } from 'src/user-roles/user-roles.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { ResetPasswordDto } from 'src/auth/dto/reset-password.dto';

export interface JWTPayload {
  sub: string;
}
@Injectable()
export class UsersService {
  private axios: AxiosInstance;

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private rolesService: RolesService,
    private userRolesService: UserRolesService,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // 1. Verify the invite token
    let tokenPayload: any;
    try {
      tokenPayload = this.jwtService.verify(createUserDto.token, {
        secret: this.configService.get('auth.jwtInviteSecretKey'),
      });
    } catch {
      throw new UnprocessableEntityException('Invalid token');
    }

    // 2. Get userType from cache
    const userType = await this.cacheManager.get<string>(
      `${this.configService.get<string>('cache.userType')}:${tokenPayload.sub}`,
    );
    if (!userType) {
      throw new UnprocessableEntityException('Invalid or expired token');
    }

    const role = await this.rolesService.findRoleIDByName(userType);
    if (!role) {
      throw new UnprocessableEntityException('Role not found or inactive');
    }

    const user = this.usersRepository.create({
      name: createUserDto.name,
      username: createUserDto.username
        ? createUserDto.username
        : `${
            (createUserDto.name || '')
              .trim()
              .replace(/\s+/g, '')
              .toLowerCase() || 'user'
          }${uuidv4().slice(0, 4)}`,
      email: tokenPayload.sub,
      emailVerifiedAt: new Date(),
      password: createUserDto.password,
    });

    try {
      const savedUser = await this.usersRepository.save(user);
      const createUserRole = {
        userId: savedUser.id,
        roleId: role!.id,
      };
      console.log('createdUserRole: ', createUserRole);
      let userRoles;
      try {
        userRoles = await this.userRolesService.create(createUserRole);
      } catch (error) {
        throw new UnprocessableEntityException(
          'Error creating user role',
          error,
        );
      }

      return { savedUser, userRoles };
    } catch (error) {
      throw new UnprocessableEntityException('Error creating user', error);
    }
  }

  async inviteUser(inviteUser: InviteUserDto) {
    // Check if the email already exists in the database
    if (inviteUser.email) {
      const existingUser = await this.findOneByEmail(inviteUser.email);
      const errorExistingEmails: ErrorFormat = {
        property: 'email',
        constraints: {
          exist: 'Email already exists',
        },
      };

      if (existingUser) {
        throw new UnprocessableEntityException([errorExistingEmails]);
      }
    }

    // check if the username already exists in the database
    if (inviteUser.username) {
      const existUsernames = await this.findOneByUsername(inviteUser.username);
      console.log(existUsernames, 'existUsernames');
      const errorUserNames: ErrorFormat = {
        property: 'username',
        constraints: { exist: 'username exist' },
      };
      if (existUsernames) {
        throw new UnprocessableEntityException([errorUserNames]);
      }
    }
    const payload: JWTPayload = {
      sub: inviteUser.email ? inviteUser.email! : inviteUser.username!,
    };

    const inviteToken = this.jwtService.sign(payload, {
      secret: this.configService.get('auth.jwtInviteSecretKey'),
      expiresIn: this.configService.get('auth.jwtInviteExpiresIn'),
    });
    const returnUrl = `${this.configService.get<string>('FRONTEND_URL')}/invite-user?token=${inviteToken}`;

    try {
      await this.cacheManager.set(
        `${this.configService.get<string>('cache.inviteToken')}:${inviteUser.email ? inviteUser.email! : inviteUser.username!}`,
        inviteToken,
        ms(this.configService.get<string>('auth.jwtInviteExpiresIn') ?? '30m'),
      );
      await this.cacheManager.set(
        `${this.configService.get<string>('cache.userType')}:${inviteUser.email ? inviteUser.email! : inviteUser.username!}`,
        inviteUser.userType,
        ms(this.configService.get<string>('auth.jwtInviteExpiresIn') ?? '30m'),
      );
      return { token: inviteToken, return_url: returnUrl };
    } catch (error) {
      console.error('Error inviting user:', error);
      throw new UnprocessableEntityException('Error invite user', error);
    }
  }

  getAllUsers() {
    return this.usersRepository.find({
      relations: ['userRoles', 'userRoles.role'],
    });
  }

  async update(updateUserDto: UpdateUserDto, id: number) {
    const user = await this.findOneOrFailByID(id);

    const userRoleId = user.userRoles[0].id; // TODO: currently in db, able to give many role to user, so accessing [0] is wrong here ( need to choose which userRole they wanna chage)
    const { userType, ...userUpdateData } = updateUserDto;

    try {
      if (Object.keys(userUpdateData).length > 0) {
        const updatePayload = { ...userUpdateData } as DeepPartial<UserEntity>;

        // If email is being updated, set emailVerifiedAt to null
        if (userUpdateData.email) {
          updatePayload.emailVerifiedAt = null;
        }

        await this.usersRepository.update(id, updatePayload);
      }

      if (userType) {
        const role = await this.rolesService.findRoleIDByName(userType);

        if (!role) {
          throw new UnprocessableEntityException('Role not found or inactive');
        }

        await this.userRolesService.update(
          {
            roleId: role.id,
            userId: id,
          },
          userRoleId,
        );
      }

      return this.findOneOrFailByID(id);
    } catch (error) {
      console.error('error', error);
      throw new UnprocessableEntityException('Error updating user', error);
    }
  }

  async findEmail(email: string) {
    const user = await this.findOneByEmail(email);

    return user;
  }

  findOneByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email: ILike(email) } });
  }
  findAllByEmail(email: string) {
    return this.usersRepository.find({ where: { email: ILike(email) } });
  }

  findAllByUsername(username: string) {
    return this.usersRepository.find({ where: { username: ILike(username) } });
  }

  findOneByUsername(username: string) {
    return this.usersRepository.findOne({
      where: { username: ILike(username) },
    });
  }

  // find one by email with password for login
  findOneByEmailWithPassword(email: string) {
    return this.usersRepository.findOne({
      where: [{ email: ILike(email) }],
      select: [
        'id',
        'name',
        'email',
        'username',
        'password',
        'status',
        'userRoles',
      ],
      relations: ['userRoles', 'userRoles.role'],
    });
  }

  findOneOrFailByID(id: number) {
    return this.usersRepository
      .findOne({
        where: { id },
        relations: ['userRoles', 'userRoles.role'],
      })
      .then((result) => {
        if (!result) {
          console.error(result);
          throw new NotFoundException('User not found');
        }
        return result;
      });
  }
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    let tokenPayload: any;
    try {
      tokenPayload = this.jwtService.verify(resetPasswordDto.token, {
        secret: this.configService.get('auth.jwtSecretKey'),
      });
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.findOneByEmail(tokenPayload.sub);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.password = resetPasswordDto.password;
    return await this.usersRepository.save(user);
  }
  // testing purposes
  async testDb() {
    try {
      const result = await this.usersRepository.query('SELECT 1 as test');
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
