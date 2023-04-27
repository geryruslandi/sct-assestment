import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FailedBirthdayNofication } from '@src/models/failed-birthday-notification.model';
import { User } from '@src/models/user.model';
import { BirthdayNotificationService } from '@src/modules/birthday-notification/birthday-notification.service';

@Module({
  imports: [SequelizeModule.forFeature([User, FailedBirthdayNofication])],
  providers: [BirthdayNotificationService],
})
export class BirthdayNotificationModule {}
