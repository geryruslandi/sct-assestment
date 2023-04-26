export class BaseResponse {
  protected response(data?: any, message = 'Success'): object {
    return {
      message,
      data,
    };
  }
}
