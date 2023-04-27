import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FailedBirthdayNofication } from '@src/models/failed-birthday-notification.model';
import { User } from '@src/models/user.model';
import { fetchWithTimeout } from '@src/utils/helper';
import * as moment from 'moment';
import { schedule } from 'node-cron';
import { Op } from 'sequelize';

@Injectable()
export class BirthdayNotificationService {
  constructor(
    @InjectModel(User)
    private user: typeof User,
    @InjectModel(FailedBirthdayNofication)
    private failedBirthdayNotification: typeof FailedBirthdayNofication,
  ) {}

  // 24 hours format
  private relativeTimeToPublish = 9;
  private publishBirthdayNotificationRetryLimit = 3;

  onApplicationBootstrap = async (): Promise<void> => {
    schedule('0 * * * *', async () => {
      await Promise.all([this.executeHourlyJob(), this.executeFailedJob()]);
    });
    // this.executeHourlyJob();
  };

  // TODO chunking users process
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
      include: FailedBirthdayNofication,
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
  private async publishBirthdayNotification(user: User): Promise<void> {
    let retry = 0;

    const publish = async () => {
      if (retry > this.publishBirthdayNotificationRetryLimit) {
        throw new Error('Maximum Retry attempted');
      }

      try {
        const response = await fetchWithTimeout(
          'https://email-service.digitalenvision.com.au/send-email',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              body: `Hey, ${user.first_name} ${user.last_name} it's your birthday`,
            }),
          },
        );

        if (response.status !== 200) {
          retry += 1;
          await publish();
        }
      } catch (err) {
        retry += 1;
        await publish();
      }
    };

    try {
      await publish();
      if (user.failedNotification) {
        await user.failedNotification.destroy();
      }
    } catch {
      if (!user.failedNotification) {
        await this.failedBirthdayNotification.create({
          user_id: user.id,
          birthday_date: moment().format('YYYY-MM-DD'),
          failed_history: [moment().format('YYYY-MM-DD')],
        });
      } else {
        user.failedNotification.failed_history.push(
          moment().format('YYYY-MM-DD'),
        );
        await user.failedNotification.save();
      }
    }
  }

  public async executeFailedJob(): Promise<void> {
    const failedUsers = await this.user.findAll({
      include: {
        model: FailedBirthdayNofication,
        required: true,
      },
    });

    await Promise.all(
      failedUsers.map((user) => this.publishBirthdayNotification(user)),
    );
  }
}
