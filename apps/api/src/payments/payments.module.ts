import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { AuthModule } from '../auth/auth.module';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [AuthModule, CreditsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService]
})
export class PaymentsModule {}
