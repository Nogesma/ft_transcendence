import pkg from "pg";
const { Client } = pkg;

const createdb = async () => {
  const client = new Client({
    user: "postgres",
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

await createdb();
