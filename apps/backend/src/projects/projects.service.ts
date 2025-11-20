import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectEntity } from './entities/project.entity';
import { Repository } from 'typeorm';
import { IsNull } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UsersService } from 'src/users/users.service';
import { UpdateProjectDTO } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(ProjectEntity)
    private readonly projectsRepository: Repository<ProjectEntity>,
  ) {}

  async create(createProjectDto: CreateProjectDto, createdBy: number) {
    const userExists = await this.usersService.findOneOrFailByID(createdBy);
    if (!userExists) {
      throw new UnprocessableEntityException([
        {
          property: 'createdBy',
          constraints: {
            exist: 'User does not exist',
          },
        },
      ]);
    }

    return this.projectsRepository.save(
      this.projectsRepository.create({ ...createProjectDto, createdBy }),
    );
  }

  async update(
    projectId: number,
    updateProjectDto: UpdateProjectDTO,
    updatedBy: number,
  ) {
    const project = await this.matchCreatorProject(updatedBy, projectId);

    return this.projectsRepository.save({
      //change this to .update for better performance NOTE: save requires full load of entity to update existing record
      ...project,
      ...updateProjectDto,
    });
  }

  matchCreatorProject(userId: number, projectId: number) {
    return this.projectsRepository
      .findOne({
        where: { createdBy: userId, id: projectId },
      })
      .then((result) => {
        if (!result) {
          throw new UnauthorizedException({
            property: 'projectId',
            constraints: {
              exist: 'Project does not exist or you are not the creator',
            },
          });
        }
        return result;
      });
  }

  async delete(projectId: number, userId: number) {
    await this.matchCreatorProject(userId, projectId);
    return this.projectsRepository.softDelete({ id: projectId });
  }
  findAllById(id: number) {
    return this.projectsRepository.find({
      where: { createdBy: id },
      relations: ['createdByUser'],
    });
  }

  async findAllProjectsUserInvolved(userId: number) {
    // Find all projects where the user is a member through project_users table
    return this.projectsRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.createdByUser', 'createdByUser')
      .leftJoin('project.projectUsers', 'projectUser')
      .where('project.createdBy = :userId', { userId })
      .orWhere('projectUser.userId = :userId', { userId })
      .getMany();
  }

  async getAllProjects(id: number) {
    // Get all projects the user is involved in, either as creator or member
    const result = await this.findAllProjectsUserInvolved(id);
    return result;
  }
}
