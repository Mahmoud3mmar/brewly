import { DynamicModule, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

@Module({})
export class CommonModule {
  static register(
    enableLogging: boolean = true,
    clsOptions: any = {},
    appName: string = 'app',
  ): DynamicModule {
    const providers: any[] = [];

    if (enableLogging) {
      providers.push({
        provide: APP_FILTER,
        useClass: GlobalExceptionFilter,
      });
    }

    return {
      module: CommonModule,
      imports: [
        ClsModule.forRoot({
          global: true,
          middleware: {
            mount: true,
            setup: (cls, req) => {
              cls.set('request', req);
            },
            ...clsOptions,
          },
        }),
      ],
      providers,
      exports: [ClsModule],
    };
  }
}

