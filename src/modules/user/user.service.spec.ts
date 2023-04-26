import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { generateSequelizeModule } from '@src/models';
import { User } from '@src/models/user.model';
import { UserService } from '@src/modules/user/user.service';
import { getConfigModule } from '@src/utils/helper';
import { silentExec } from '@src/utils/test-helper';

describe('UserService', () => {
  let service: UserService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        generateSequelizeModule(true),
        getConfigModule(true),
        SequelizeModule.forFeature([User]),
      ],
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  beforeEach(async () => {
    await silentExec('yarn migrate:down:all');
    await silentExec('yarn migrate:up');
  });

  it('should able to create user with correct data', async () => {
    const user = await service.createUser({
      first_name: 'gery',
      last_name: 'ruslandi',
      birthday: '01-02-1990',
      location: 'UTC+2',
    });
    expect(user).toBeTruthy();
  });

  it('should not be able to create user with incorrect location', async () => {
    expect(async () => {
      await service.createUser({
        first_name: 'gery',
        last_name: 'ruslandi',
        birthday: '01-02-1990',
        location: 'incorrect location format',
      });
    }).rejects.toThrowError();
  });

  it('should able to destroy correct user', async () => {
    const user = await service.createUser({
      first_name: 'gery',
      last_name: 'ruslandi',
      birthday: '01-02-1990',
      location: 'UTC+2',
    });

    await service.destroyUser(user.id);

    const data = await User.findAll();

    expect(data).toHaveLength(0);
  });

  it('should not be able to destroy unexist user', async () => {
    await service.createUser({
      first_name: 'gery',
      last_name: 'ruslandi',
      birthday: '01-02-1990',
      location: 'UTC+2',
    });

    await service.destroyUser(999);

    const data = await User.findAll();

    expect(data).toHaveLength(1);
  });
});
