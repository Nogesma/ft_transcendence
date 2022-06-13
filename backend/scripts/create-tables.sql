CREATE TABLE "Users" (
  "id" int PRIMARY KEY,
  "login" varchar unique,
  "displayname" varchar unique,
  "image_url" varchar
);
CREATE TABLE "Session" (
  "id" int PRIMARY KEY,
  "token" varchar UNIQUE
);

ALTER TABLE "Session" ADD FOREIGN KEY ("id") REFERENCES "Users" ("id");