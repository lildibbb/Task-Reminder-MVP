import { DataSource } from 'typeorm';
import databaseConfig from '../config/database-config';
import testDatabaseConfig from '../config/test-database-config';

export const AppDataSource = new DataSource(
  process.env.NODE_ENV === 'test' ? testDatabaseConfig : databaseConfig,
);
