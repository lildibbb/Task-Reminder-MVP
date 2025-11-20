import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AdjustNameColumn1745143974760 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'users',
      'name',
      new TableColumn({
        name: 'name',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'users',
      'name',
      new TableColumn({
        name: 'name',
        type: 'varchar',
        length: '255',
        isNullable: false,
      }),
    );
  }
}
