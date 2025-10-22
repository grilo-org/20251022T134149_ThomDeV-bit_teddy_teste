import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        bufferLogs: true,
        cors: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );
    const config = new DocumentBuilder()
        .setTitle('Shorten')
        .setDescription('Api de encurtamento de url')
        .setVersion('1.0')
        .addTag('Shorten')
        .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'ENTER JWT TOKEN',
            in: 'header'
        }, "JWT-auth")
        .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api/swagger', app, documentFactory);

    await app.listen(process.env.PORT ?? 3000);

    const url = await app.getUrl()

    console.log(`Swagger application is running on: ${url}/api/swagger`)
}
bootstrap();
