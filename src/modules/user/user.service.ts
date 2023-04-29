import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '@src/models/user.model';
import { UserFormSchema } from '@src/modules/user/dto/create-user.dto';
import * as moment from 'moment';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private user: typeof User,
  ) {}

  public createUser(dto: UserFormSchema): Promise<User> {
    const birthday = moment(dto.birthday, 'DD-MM-YYYY');
    return this.user.create({
      email: dto.email,
      first_name: dto.first_name,
      last_name: dto.last_name,
      location: dto.location,
      birthday_month: birthday.month() + 1,
      birthday_day: birthday.date(),
      birthday: birthday.format('YYYY-MM-DD'),
    });
  }

  public async destroyUser(userId: number): Promise<void> {
    await this.user.destroy({
      where: {
        id: userId,
      },
    });
  }

  public async updateUser(userId: number, dto: UserFormSchema): Promise<User> {
    const user = await this.user.findByPk(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const birthday = moment(dto.birthday, 'DD-MM-YYYY');
    await user.update({
      email: dto.email,
      first_name: dto.first_name,
      last_name: dto.last_name,
      location: dto.location,
      birthday_month: birthday.month() + 1,
      birthday_day: birthday.date(),
      birthday: birthday.format('YYYY-MM-DD'),
    });

    return user;
  }
}
