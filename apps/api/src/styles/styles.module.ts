import { Module } from '@nestjs/common';
import { StylesController } from './styles.controller';
import { StylesService } from './styles.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [StylesController],
  providers: [StylesService],
  exports: [StylesService]
})
export class StylesModule {}
