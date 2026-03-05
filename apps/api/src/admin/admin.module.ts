import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CreditsModule } from '../credits/credits.module';
import { AdminController, CatalogController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [AuthModule, CreditsModule],
  controllers: [AdminController, CatalogController],
  providers: [AdminService],
  exports: [AdminService]
})
export class AdminModule {}
