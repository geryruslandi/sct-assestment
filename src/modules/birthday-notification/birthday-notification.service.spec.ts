import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { generateSequelizeModule } from '@src/models';
import { FailedBirthdayNofication } from '@src/models/failed-birthday-notification.model';
import { User } from '@src/models/user.model';
import { BirthdayNotificationService } from '@src/modules/birthday-notification/birthday-notification.service';
import { getConfigModule } from '@src/utils/helper';
import { silentExec } from '@src/utils/test-helper';
import * as helper from '@src/utils/helper';

describe('BirthdayNotificationService', () => {
  let service: BirthdayNotificationService;

  beforeEach(async () => {
    jest.restoreAllMocks();

    jest.spyOn(helper, 'fetchWithTimeout').mockReturnValue(
      Promise.resolve({
        status: 200,
      } as Response),
    );

    jest
      .spyOn(Date, 'now')
      .mockReturnValue(new Date('2023-02-02T00:00:00.000Z').getTime());

    await silentExec('yarn migrate:down:all');
    await silentExec('yarn migrate:up');

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        getConfigModule(true),
        generateSequelizeModule(true),
        SequelizeModule.forFeature([User, FailedBirthdayNofication]),
      ],
      providers: [BirthdayNotificationService],
    }).compile();

    service = module.get<BirthdayNotificationService>(
      BirthdayNotificationService,
    );
  });

  it('should only notify birthday to all of user who is having a birthday when its 9am relative to their UTC timezone', async () => {
    const selected = await User.create({
      email: 'geryruslandi@gmail.com',
      first_name: 'gery',
      last_name: 'ruslandi',
      location: 'UTC+9',
      birthday: '2000-02-02',
      birthday_month: 2,
      birthday_day: 2,
    });

    await User.create({
      email: 'geryruslandi@gmail.com',
      first_name: 'gery',
      last_name: 'ruslandi',
      location: 'UTC+10',
      birthday: '2000-02-02',
      birthday_month: 2,
      birthday_day: 2,
    });

    const data = await service.executeHourlyJob();

    expect(data).toHaveLength(1);
    expect(data[0].id).toBe(selected.id);
  });
  it('when failed to send birthday notification, should retry three times before recording failed job', async () => {
    const mock = jest.spyOn(helper, 'fetchWithTimeout').mockReturnValue(
      Promise.resolve({
        status: 400,
      } as Response),
    );

    await User.create({
      email: 'geryruslandi@gmail.com',
      first_name: 'gery',
      last_name: 'ruslandi',
      location: 'UTC+9',
      birthday: '2000-02-02',
      birthday_month: 2,
      birthday_day: 2,
    });

    await service.executeHourlyJob();

    expect(mock).toHaveBeenCalledTimes(4);
  });
  it('when request timeout, should retry 3 times, then record failed job if keep failing three times', async () => {
    const mock = jest
      .spyOn(helper, 'fetchWithTimeout')
      .mockImplementation(async () => {
        throw new AbortController();
      });

    await User.create({
      email: 'geryruslandi@gmail.com',
      first_name: 'gery',
      last_name: 'ruslandi',
      location: 'UTC+9',
      birthday: '2000-02-02',
      birthday_month: 2,
      birthday_day: 2,
    });

    await service.executeHourlyJob();

    expect(mock).toHaveBeenCalledTimes(4);
  });
  it('should not record job as failed when birthday notification successfully published', async () => {
    await User.create({
      email: 'geryruslandi@gmail.com',
      first_name: 'gery',
      last_name: 'ruslandi',
      location: 'UTC+9',
      birthday: '2000-02-02',
      birthday_month: 2,
      birthday_day: 2,
    });

    await service.executeHourlyJob();

    const errorLogsCount = await FailedBirthdayNofication.count();

    expect(errorLogsCount).toBe(0);
  });
  it('should able to retry publisheh failed jobs', async () => {
    jest.spyOn(helper, 'fetchWithTimeout').mockImplementation(async () => {
      throw new AbortController();
    });

    await User.create({
      email: 'geryruslandi@gmail.com',
      first_name: 'gery',
      last_name: 'ruslandi',
      location: 'UTC+9',
      birthday: '2000-02-02',
      birthday_month: 2,
      birthday_day: 2,
    });

    await service.executeHourlyJob();

    expect(await FailedBirthdayNofication.count()).toBe(1);

    jest.spyOn(helper, 'fetchWithTimeout').mockReturnValue(
      Promise.resolve({
        status: 200,
      } as Response),
    );

    await service.executeFailedJob();

    expect(await FailedBirthdayNofication.count()).toBe(0);
  });
  it('should remove failed record when retried failed record successfuly published', async () => {
    jest.spyOn(helper, 'fetchWithTimeout').mockImplementation(async () => {
      throw new AbortController();
    });

    const user = await User.create({
      email: 'geryruslandi@gmail.com',
      first_name: 'gery',
      last_name: 'ruslandi',
      location: 'UTC+9',
      birthday: '2000-02-02',
      birthday_month: 2,
      birthday_day: 2,
    });

    await service.executeHourlyJob();

    jest.spyOn(helper, 'fetchWithTimeout').mockReturnValue(
      Promise.resolve({
        status: 200,
      } as Response),
    );

    await service.executeFailedJob();

    expect(
      await FailedBirthdayNofication.count({
        where: {
          user_id: user.id,
        },
      }),
    ).toBe(0);
  });
});
