import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import "dotenv/config";
import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.REDIRECT_URI,
    credentials: true,
  });
  app.use(cookieParser(process.env.COOKIE_SECRET));
  await app.listen(3000);
}

bootstrap();
