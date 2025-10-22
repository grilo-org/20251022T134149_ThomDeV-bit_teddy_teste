import { Module } from '@nestjs/common';
import { TypeormModule } from './infrastructure/database/repositories/typeorm.module';
import { RepositoryModule } from './infrastructure/database/repositories/repositories.module';
import { ApiModule } from './api/api.module';
import { UseCaseModule } from './use-cases/use-case.module';
import { JwtModule } from '@nestjs/jwt';
import 'dotenv/config';
import { LoggerModule } from 'nestjs-pino';
@Module({
    imports: [
        TypeormModule.register(RepositoryModule.register()),
        ApiModule.register({ useCaseModule: UseCaseModule.register() }),
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET_KEY,
            signOptions: {
                expiresIn: Number(process.env.JWT_EXPIRE_IN)
            },
            verifyOptions: {
                ignoreExpiration: false
            }
        }),
        LoggerModule.forRoot({
            pinoHttp: {
                serializers: {
                    req(req) {
                        return {
                            method: req.method,
                            url: req.url,
                        };
                    },
                    res(res) {
                        return {
                            statusCode: res.statusCode,
                        };
                    },
                },
                transport:
                    process.env.NODE_ENV !== 'production'
                        ? {
                            target: 'pino-pretty',
                            options: {
                                colorize: true,
                                translateTime: 'SYS:standard',
                                ignore: 'pid,hostname',
                            },
                        }
                        : undefined,
            },
        }),
    ]
})


export class AppModule { }
