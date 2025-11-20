import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterTaskTableStatusColumn1747209861331
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'tasks',
      'status',
      new TableColumn({
        name: 'status',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'tasks',
      'status',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: ['new', 'doing', 'done', 'rejected', 'verified', 'closed'],
        enumName: 'task_status_enum',
        default: `'new'`,
      }),
    );
  }
}
