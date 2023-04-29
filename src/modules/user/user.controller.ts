import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UsePipes,
} from '@nestjs/common';
import {
  UserFormSchema,
  userFormSchema,
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
  @UsePipes(new JoiValidation(userFormSchema))
  public async store(@Body() dto: UserFormSchema) {
    const user = await this.service.createUser(dto);

    return this.response({
      user,
    });
  }

  @Delete(':id')
  public async destroy(@Param('id', ParseIntPipe) id: number) {
    await this.service.destroyUser(id);

    return this.response();
  }

  @Put(':id')
  @UsePipes(new JoiValidation(userFormSchema))
  public async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UserFormSchema,
  ) {
    const user = await this.service.updateUser(id, dto);

    return this.response({
      user,
    });
  }
}
