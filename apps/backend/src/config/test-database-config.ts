import 'dotenv/config';
import { SnakeNamingStrategy } from '../database/naming-strategies/snake-naming.strategy';
import { DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';

const testDatabaseConfig: DataSourceOptions & SeederOptions = {
  type: <any>process.env.DB_TEST_TYPE,
  ...(process.env.DB_TEST_URL && { url: process.env.DB_TEST_URL }),
  ...(!process.env.DB_TEST_URL && { host: process.env.DB_TEST_HOST }),
  ...(!process.env.DB_URL && { port: parseInt(process.env.DB_PORT!, 10) }),
  ...(!process.env.DB_TEST_URL && { username: process.env.DB_TEST_USER }),
  ...(!process.env.DB_TEST_URL && { password: process.env.DB_TEST_PASS }),
  ...(!process.env.DB_TEST_URL && { database: process.env.DB_TEST_NAME }),
  entities: ['src/**/entities/**', '*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'],
  seeds: ['src/database/seeds/*{.ts,.js}', 'src/database/seeds/**/*{.ts,.js}'],
  synchronize: false, // Set to false else might have risk of dropping columns in production table which is very dangerous
  dropSchema: false, // Set to false else might have risk of dropping database in production table which is very dangerous
  namingStrategy: new SnakeNamingStrategy(), // Using snake case naming strategy
};

export default testDatabaseConfig;
