import 'dotenv/config';
import { DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { SnakeNamingStrategy } from '../database/naming-strategies/snake-naming.strategy';
const databaseConfig: DataSourceOptions & SeederOptions = {
  type: <any>process.env.DB_TYPE,
  ...(process.env.DB_URL && { url: process.env.DB_URL }),
  ...(!process.env.DB_URL && { host: process.env.DB_HOST }),
  ...(!process.env.DB_URL && { port: parseInt(process.env.DB_PORT!, 10) }),
  ...(!process.env.DB_URL && { username: process.env.DB_USER }),
  ...(!process.env.DB_URL && { password: process.env.DB_PASS }),
  ...(!process.env.DB_URL && { database: process.env.DB_NAME }),
  entities: ['src/**/entities/**', '*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'],
  seeds: ['src/database/seeds/*{.ts,.js}'],
  synchronize: false, // set true for dev only, false for prod to avoid accidental dropping of tables/columns
  dropSchema: false, //if true, it will drop the schema before running the migrationss
  namingStrategy: new SnakeNamingStrategy(), // Use snake_case for all tables and columns
  ...(process.env.DB_SSL && {
    ssl: {
      rejectUnauthorized: false,
      ...(process.env.DB_SSL_CERT && {
        ca: process.env,
      }),
    },
  }),
};

export default databaseConfig;
