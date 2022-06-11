import pkg from "pg";

const { Client } = pkg;

const initdb = async () => {
  const client = new Client({
    user: process.env.DB_USER,
    host: "localhost",
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
  });

  client.connect();
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  await client.query(`CREATE DATABASE ${process.env.DB_NAME}`).catch(() => {
    console.log("DB already exist");
  });
  await client
    .query(
      `CREATE USER ${process.env.DB_USER} with password '${process.env.DB_PASSWORD}'`
    )
    .catch(() => {
      console.log("User already exist");
    });
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
      console.log("Table already exist");
    });
  await client.end();
};
await initdb();
