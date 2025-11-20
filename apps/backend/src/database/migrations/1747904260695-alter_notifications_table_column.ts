import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterNotificationsTableColumn1747904260695
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'notifications',
      'notification_type',
      new TableColumn({
        name: 'notification_type',
        type: 'varchar',
        length: '255',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'notifications',
      'notification_type',
      new TableColumn({
        name: 'notification_type',
        type: 'enum',
        enum: ['task_due', 'task_assigned'],
        enumName: 'notification_type_enum',
      }),
    );
  }
}
