import pkg from "pg";

const { Client } = pkg;

const initdb = async () => {
  const client = new Client({
    user: process.env.USER,
    host: "localhost",
    password: "",
    port: 5432,
    database: "template1",
  });

  client.connect();

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  await client.query(`CREATE DATABASE ${process.env.DB_NAME}`).catch(() => {});
  await client
    .query(
      `CREATE USER ${process.env.DB_USER} with password '${process.env.DB_PASSWORD}'`
    )
    .catch(() => {});
  await client.end();
};

initdb();
