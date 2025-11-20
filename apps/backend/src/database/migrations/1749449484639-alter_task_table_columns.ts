import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterTaskTableColumns1749449484639 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'tasks',
      'assignee_id',
      new TableColumn({
        name: 'assignee_id',
        type: 'bigint',
      }),
    );
    await queryRunner.changeColumn(
      'tasks',
      'verifier_id',
      new TableColumn({
        name: 'verifier_id',
        type: 'bigint',
      }),
    );
    await queryRunner.changeColumn(
      'tasks',
      'priority',
      new TableColumn({
        name: 'priority',
        type: 'enum',
        enum: ['high', 'medium', 'low', 'critical'],
        enumName: 'task_priority_enum',
        default: `'medium'`,
      }),
    );
    await queryRunner.addColumns('tasks', [
      new TableColumn({
        name: 'start_date',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'is_repeating',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
      new TableColumn({
        name: 'repeat_frequency',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
      new TableColumn({
        name: 'reminder_time',
        type: 'timestamp',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('tasks', [
      'start_date',
      'is_repeating',
      'repeat_frequency',
      'reminder_time',
    ]);

    await queryRunner.changeColumn(
      'tasks',
      'priority',
      new TableColumn({
        name: 'priority',
        type: 'enum',
        enum: ['high', 'medium', 'low'],
        enumName: 'task_priority_enum',
        default: `'medium'`,
      }),
    );

    await queryRunner.changeColumn(
      'tasks',
      'assignee_id',
      new TableColumn({
        name: 'assignee_id',
        type: 'bigint',
        isNullable: true,
      }),
    );

    await queryRunner.changeColumn(
      'tasks',
      'verifier_id',
      new TableColumn({
        name: 'verifier_id',
        type: 'bigint',
        isNullable: true,
      }),
    );
  }
}
