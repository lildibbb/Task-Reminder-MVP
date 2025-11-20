import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterTaskTableColumns1749451857893 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'tasks',
      'expected_result',
      new TableColumn({
        name: 'expected_result',
        type: 'jsonb',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'tasks',
      'expected_result',
      new TableColumn({
        name: 'expected_result',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
  }
}
