import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '100mb' })); // adjust as needed
  app.use(urlencoded({ limit: '100mb', extended: true }));
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
  console.log('Server is running on port ' + process.env.PORT);
}
bootstrap();
