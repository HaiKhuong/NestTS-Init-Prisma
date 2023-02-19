import { ApiModule } from '@api/api.module';
import { AuthModule } from '@auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServicesModule } from '@services/services.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAIL_HOST'),
          port: configService.get('MAIL_PORT'),
          secure: configService.get('MAIL_PORT') === 465,
          auth: {
            user: configService.get('MAIL_USERNAME'),
            pass: configService.get('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"DUCTIN" <${configService.get('MAIL_USERNAME')}>`,
        },
        template: {
          dir: process.cwd() + '/src/templates/',
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
    }),
    ApiModule,
    AuthModule,
    ServicesModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [Logger],
})
export class AppModule {}
