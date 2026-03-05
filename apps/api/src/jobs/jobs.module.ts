import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { CreditsModule } from '../credits/credits.module';
import { AuthModule } from '../auth/auth.module';
import { QueueService } from './queue.service';
import { LimitsModule } from '../limits/limits.module';

@Module({
  imports: [CreditsModule, AuthModule, LimitsModule],
  controllers: [JobsController],
  providers: [JobsService, QueueService],
  exports: [JobsService, QueueService]
})
export class JobsModule {}
