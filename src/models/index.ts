import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '@src/models/user.model';

export const generateSequelizeModule = (forTesting = false) =>
  SequelizeModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      dialect: 'postgres',
      host: config.getOrThrow('DB_HOST'),
      port: config.getOrThrow('DB_PORT'),
      username: config.getOrThrow('DB_USER'),
      password: config.getOrThrow('DB_PASSWORD'),
      database: config.getOrThrow('DB_DATABASE'),
      models: [User],
      logging: !forTesting,
    }),
  });
