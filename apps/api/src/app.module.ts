import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SessionMiddleware } from './common/session.middleware';
import { StylesModule } from './styles/styles.module';
import { AssetsModule } from './assets/assets.module';
import { JobsModule } from './jobs/jobs.module';
import { PaymentsModule } from './payments/payments.module';
import { CreditsModule } from './credits/credits.module';
import { HealthModule } from './health/health.module';
import { LimitsModule } from './limits/limits.module';
import { ArticlesModule } from './articles/articles.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    LimitsModule,
    CreditsModule,
    AuthModule,
    StylesModule,
    AssetsModule,
    JobsModule,
    PaymentsModule,
    HealthModule,
    ArticlesModule,
    AdminModule
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(SessionMiddleware).forRoutes('*');
  }
}
