import pkg from "pg";
const { Client } = pkg;

const createdb = async () => {
  const client = new Client({
    user: process.env.USER,
    host: "localhost",
    password: "",
    port: 5432,
    database: "template1",
  });
  client.connect();
  await client.query(`CREATE DATABASE ${process.env.DB_NAME}`).catch(() => {
    console.error("DB already exist");
  });
  await client
    .query(
      `CREATE USER ${process.env.DB_USER} with password '${process.env.DB_PASSWORD}'`
    )
    .catch(() => {
      console.error("User already exist");
    });
  await client.end();
};

const initdb = async () => {
  const client = new Client({
    user: process.env.DB_USER,
    host: "localhost",
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
  });

  client.connect();
  await client
    .query(
      `
    CREATE TABLE "Users" (
	    "id" int PRIMARY KEY,
	    "login" VARCHAR unique,
	    "displayname" VARCHAR unique,
	    "image_url" varchar,
	    "tfa" boolean
    );`
    )
    .catch(() => {
      console.error("Table already exist");
    });

  await client
    .query(
      `CREATE TABLE "Sessions" (
          "id" int,
          FOREIGN KEY (id) REFERENCES "Users" (id),
          "token" varchar UNIQUE,
          "expires" timestamp
    );`
    )
    .catch(console.error);

  await client
    .query(
      `CREATE TABLE "TwoFactorSecrets" (
          "id" int,
          FOREIGN KEY (id) REFERENCES "Users" (id),
          "secret" varchar UNIQUE,
          "temp" boolean
    );`
    )
    .catch(console.error);

  await client
    .query(
      `CREATE TABLE "Temporary2FATokens" (
          "id" int,
          FOREIGN KEY (id) REFERENCES "Users" (id),
          "token" varchar UNIQUE,
          "expires" timestamp
    );`
    )
    .catch(console.error);

  await client.end();
};
await createdb();
await initdb();
