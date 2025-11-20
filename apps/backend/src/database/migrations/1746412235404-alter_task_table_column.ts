import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterTaskTableColumn1746412235404 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'tasks',
      'description',
      new TableColumn({
        name: 'description',
        type: 'jsonb',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'tasks',
      'description',
      new TableColumn({
        name: 'description',
        type: 'text',
        isNullable: true,
      }),
    );
  }
}
