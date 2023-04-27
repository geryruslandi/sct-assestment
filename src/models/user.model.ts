import { Column, DataType, Is, Model, Table } from 'sequelize-typescript';

@Table({
  underscored: true,
  tableName: 'users',
})
export class User extends Model {
  @Column
  first_name!: string;

  @Column
  last_name!: string;

  @Is('UTC Format', (value: string) => {
    const matched = value.match(/UTC([\+|\-])([0-9]+)/);

    if (!matched) {
      throw new Error(`Location format should be 'UTC-{TZ}'`);
    }

    const number = Number(matched[2]);

    if (number > 24) {
      throw new Error(`Location timezone should not be greater that 24`);
    }
  })
  @Column
  location!: string;

  @Column(DataType.DATEONLY)
  birthday!: Date;

  @Column
  birthday_month!: number;

  @Column
  birthday_day!: number;
}
