import { Module } from '@nestjs/common';
import { generateSequelizeModule } from '@src/models';
import { AppService } from '@src/modules/app.service';
import { UserModule } from './user/user.module';
import { getConfigModule } from '@src/utils/helper';
import { BirthdayNotificationModule } from '@src/modules/birthday-notification/birthday-notification.module';

@Module({
  imports: [
    generateSequelizeModule(),
    getConfigModule(),
    UserModule,
    BirthdayNotificationModule,
  ],
  providers: [AppService],
})
export class AppModule {}
