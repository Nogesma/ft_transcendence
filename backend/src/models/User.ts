import pkg from "pg";
const { Client } = pkg;
const func = (id, login, displayname, image_url) => {
  const client = new Client({
    user: process.env.DB_USER,
    host: "localhost",
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
  });
  client.connect();
  client.query(`insert into users (id, login, displayname, image_url)
    values (${id}, ${login}, ${displayname}, ${image_url})`);
};
func(103, "lgyger", "Leo Gyger", "test");
