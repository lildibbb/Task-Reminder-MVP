import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterActivityLogTableColumn1747191347356
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'activity_logs',
      'action_type',
      new TableColumn({
        name: 'action_type',
        type: 'varchar',
        length: '255',
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'activity_logs',
      'action_type',
      new TableColumn({
        name: 'action_type',
        type: 'enum',
        enum: ['add_label', 'remove_label', 'change_label'],
        enumName: 'action_type_enum',
        isNullable: false,
      }),
    );
  }
}
