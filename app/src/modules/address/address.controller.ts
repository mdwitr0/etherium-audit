import { Controller, Get } from '@nestjs/common';
import { GET_NUMBER_BLOCKS } from '../../constants/cron.constants';
import { AddressService } from './address.service';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get('most-changed')
  async findMostChanges() {
    return this.addressService.findMostChanges(GET_NUMBER_BLOCKS);
  }
}
