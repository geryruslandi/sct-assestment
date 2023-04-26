import { ConfigModule } from '@nestjs/config';

export const getConfigModule = (forTesting = false) => {
  return ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: forTesting ? '.env.test' : '.env',
  });
};
