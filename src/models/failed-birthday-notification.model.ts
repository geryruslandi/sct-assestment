import { User } from '@src/models/user.model';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

@Table({
  underscored: true,
  tableName: 'failed_birthday_notifications',
})
export class FailedBirthdayNofication extends Model {
  @ForeignKey(() => User)
  @Column
  user_id!: number;

  @Column(DataType.DATE)
  birthday_date!: Date;

  @Column(DataType.ARRAY(DataType.DATE))
  failed_history!: Date[];

  @BelongsTo(() => User)
  user!: User;
}
