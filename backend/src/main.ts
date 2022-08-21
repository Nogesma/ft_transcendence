import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import cookieParser from "cookie-parser";
import { ConfigService } from "@nestjs/config";
import { DatabaseService } from "./database/database.service.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Sync databases with model before launching app.
  // This will create any missing table.
  const databaseService = app.get(DatabaseService);
  await databaseService.sync();

  const configService = app.get(ConfigService<EnvironmentVariables, true>);
  app.enableCors({
    origin: configService.get("REDIRECT_URI"),
    credentials: true,
  });
  app.setGlobalPrefix("/api");
  app.use(cookieParser(configService.get("COOKIE_SECRET")));
  await app.listen(3000);
}

bootstrap();
