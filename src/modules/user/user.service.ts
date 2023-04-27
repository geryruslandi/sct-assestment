import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '@src/models/user.model';
import { CreateUserDto } from '@src/modules/user/dto/create-user.dto';
import * as moment from 'moment';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private user: typeof User,
  ) {}

  public createUser(dto: CreateUserDto): Promise<User> {
    const birthday = moment(dto.birthday, 'DD-MM-YYYY');
    return this.user.create({
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
}
