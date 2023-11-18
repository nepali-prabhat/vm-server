import { Controller, Get, ImATeapotException } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  teapot() {
    throw new ImATeapotException();
  }
}
