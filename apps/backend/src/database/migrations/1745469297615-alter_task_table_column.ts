import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AlterTaskTableColumn1745469297615 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const foreignKey = new TableForeignKey({
      columnNames: ['project_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'projects',
      onDelete: 'CASCADE',
    });
    await queryRunner.dropForeignKey('tasks', foreignKey);

    await queryRunner.changeColumn(
      'tasks',
      'project_id',
      new TableColumn({
        name: 'project_id',
        type: 'bigint',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey('tasks', foreignKey);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const foreignKey = new TableForeignKey({
      columnNames: ['project_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'projects',
      onDelete: 'CASCADE',
    });
    await queryRunner.dropForeignKey('tasks', foreignKey);

    await queryRunner.changeColumn(
      'tasks',
      'project_id',
      new TableColumn({
        name: 'project_id',
        type: 'bigint',
        isNullable: false,
      }),
    );

    await queryRunner.createForeignKey('tasks', foreignKey);
  }
}
