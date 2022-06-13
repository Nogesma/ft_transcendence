import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import "dotenv/config";
import Users from "./models/Users.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await Users.create({
    id: 42,
    login: "lgyger",
    displayname: "abc",
    image_url: "efg",
    tfa: true,
  });
  await app.listen(3000);
}

bootstrap();
