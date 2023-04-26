import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common';
import {
  CreateUserDto,
  createUserSchema,
} from '@src/modules/user/dto/create-user.dto';
import { UserService } from '@src/modules/user/user.service';
import { JoiValidation } from '@src/pipes/joi-validation.pipe';
import { BaseResponse } from '@src/utils/base-response';

@Controller('user')
export class UserController extends BaseResponse {
  constructor(private service: UserService) {
    super();
  }

  @Post()
  @UsePipes(new JoiValidation(createUserSchema))
  public async store(@Body() dto: CreateUserDto) {
    const user = await this.service.createUser(dto);

    return this.response({
      user,
    });
  }

  @Delete(':id')
  public async destroy(@Param('id') id: number) {
    await this.service.destroyUser(id);

    return this.response();
  }
}
