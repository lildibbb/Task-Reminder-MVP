import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterCommentTableColumn1749450457021
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('comments', [
      new TableColumn({
        name: 'type',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('comments', 'type');
  }
}
