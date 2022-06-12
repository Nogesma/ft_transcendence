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
    CREATE TABLE "users" (
	    "id" int PRIMARY KEY,
	    "login" VARCHAR unique,
	    "displayname" VARCHAR unique,
	    "image_url" varchar
    );`
    )
    .catch(() => {
      console.error("Table already exist");
    });
  await client
    .query(
      `CREATE TABLE "Session" (
          "id" int PRIMARY KEY,
          "token" varchar UNIQUE
    );`
    )
    .catch(() => {
      console.error("Second table already exist");
    });
  await client.end();
};
await createdb();
await initdb();
