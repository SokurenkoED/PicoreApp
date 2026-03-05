import { Module } from '@nestjs/common';
import { FreeLimitService } from './free-limit.service';

@Module({
  providers: [FreeLimitService],
  exports: [FreeLimitService]
})
export class LimitsModule {}
