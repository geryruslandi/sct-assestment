import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { generateSequelizeModule } from '@src/models';
import { AppService } from '@src/modules/app.service';
import { UserModule } from './user/user.module';
import { getConfigModule } from '@src/utils/helper';

@Module({
  imports: [generateSequelizeModule(), getConfigModule(), UserModule],
  providers: [AppService],
})
export class AppModule {}
