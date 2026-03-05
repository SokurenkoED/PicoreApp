import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreditsModule } from '../credits/credits.module';
import { LimitsModule } from '../limits/limits.module';
import { AdminGuard } from './admin.guard';

@Module({
  imports: [CreditsModule, LimitsModule],
  providers: [AuthService, AdminGuard],
  controllers: [AuthController],
  exports: [AuthService, AdminGuard]
})
export class AuthModule {}
