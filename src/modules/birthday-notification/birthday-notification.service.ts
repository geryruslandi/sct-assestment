import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '@src/models/user.model';
import * as moment from 'moment';
import { schedule } from 'node-cron';
import { Op } from 'sequelize';

@Injectable()
export class BirthdayNotificationService {
  constructor(
    @InjectModel(User)
    private user: typeof User,
  ) {}

  // 24 hours format
  private relativeTimeToPublish = 9;

  onApplicationBootstrap = async (): Promise<void> => {
    schedule('0 * * * *', async () => {
      await Promise.all([this.executeHourlyJob(), this.executeFailedJob()]);
    });
    // this.executeHourlyJob();
  };

  public async executeHourlyJob(): Promise<void> {
    const utcsToProceed = this.getUTCSToProceed();

    const mappedWhere = utcsToProceed.map((utc) => ({
      [Op.and]: {
        location: utc.utc,
        birthday_day: utc.date.day,
        birthday_month: utc.date.month,
      },
    }));

    const users = await this.user.findAll({
      where: {
        [Op.or]: mappedWhere,
      },
    });

    await Promise.all(
      users.map((user) => this.publishBirthdayNotification(user)),
    );
  }

  private getUTCSToProceed(): Array<{
    utc: string;
    date: { day: number; month: number };
  }> {
    const currentUTCHour = moment().utc().hour();
    const subHour = currentUTCHour - this.relativeTimeToPublish;
    let utcNumbers: number[] = [];

    if (subHour === 0) {
      utcNumbers = [0, -0, 24, -24];
    } else {
      const firstUtc = -(currentUTCHour - this.relativeTimeToPublish);

      const secondUtc =
        subHour < 0
          ? -(currentUTCHour - this.relativeTimeToPublish + 24)
          : -(currentUTCHour - this.relativeTimeToPublish - 24);

      utcNumbers = [firstUtc, secondUtc];
    }

    return utcNumbers.map((utc) => {
      const date = moment().utc().add(utc, 'hours');
      return {
        utc: this.convertUtcToString(utc),
        date: {
          day: date.date(),
          month: date.month() + 1,
        },
      };
    });
  }

  private convertUtcToString(utc: number) {
    return utc > 0 ? `UTC+${utc}` : `UTC${utc}`;
  }

  // TODO publish birthday using instructed api
  private async publishBirthdayNotification(user: User): Promise<void> {}

  public async executeFailedJob(): Promise<void> {}
}
