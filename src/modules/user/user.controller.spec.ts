import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { silentExec } from '@src/utils/test-helper';
import { User } from '@src/models/user.model';
import { generateSequelizeModule } from '@src/models';
import { getConfigModule } from '@src/utils/helper';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserService } from '@src/modules/user/user.service';

describe('UserController', () => {
  let controller: UserController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        getConfigModule(true),
        generateSequelizeModule(true),
        SequelizeModule.forFeature([User]),
      ],
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  beforeEach(async () => {
    await silentExec('yarn migrate:down:all');
    await silentExec('yarn migrate:up');
  });

  it('should be able to create new user with correct data', async () => {
    await controller.store({
      email: 'geryruslandi@gmail.com',
      first_name: 'gery',
      last_name: 'ruslandi',
      birthday: '01-02-1990',
      location: 'UTC+2',
    });

    const data = await User.findAll();

    expect(data).toHaveLength(1);
  });

  it('should not be able to create new user with incorrect location data', async () => {
    expect(async () => {
      await controller.store({
        email: 'geryruslandi@gmail.com',
        first_name: 'gery',
        last_name: 'ruslandi',
        birthday: '01-02-1990',
        location: 'UTC+233',
      });
    }).rejects.toThrowError();
  });

  it('should be able to update existing user', async () => {
    const res = (await controller.store({
      email: 'geryruslandi@gmail.com',
      first_name: 'gery',
      last_name: 'ruslandi',
      birthday: '01-02-1990',
      location: 'UTC+2',
    })) as any;

    const user = res.data.user;

    await controller.update(user.id, {
      email: 'geryruslandi@gmail.com',
      first_name: 'gery updated',
      last_name: 'ruslandi',
      birthday: '01-02-1990',
      location: 'UTC+2',
    });

    await user.reload();

    expect(user.first_name).toBe('gery updated');
  });
});
