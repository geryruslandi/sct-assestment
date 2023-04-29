import * as Joi from 'joi';
import * as moment from 'moment';

export const userFormSchema = Joi.object({
  email: Joi.string().email().required(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  location: Joi.string()
    .custom((item: string) => {
      const matched = item.match(/UTC([\+|\-])([0-9]+)/);

      if (!matched) {
        throw new Error(`Location format should be like 'UTC+2'`);
      }

      const number = Number(matched[2]);

      if (number > 24) {
        throw new Error(`Location timezone should not be greater that 24`);
      }

      return number;
    })
    .required(),
  birthday: Joi.string()
    .custom((item: string) => {
      const date = moment(item, 'DD-MM-YYYY');

      if (!date.isValid()) {
        throw new Error(
          `Birthday format is incorrect, correct format should be DD-MM-YYYY`,
        );
      }

      return date;
    })
    .required(),
});

export interface UserFormSchema {
  email: string;
  first_name: string;
  last_name: string;
  birthday: string;
  location: string;
}
