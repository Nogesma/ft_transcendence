import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";

const Users = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    login: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    displayname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tfa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  { timestamps: false }
);

export default Users;
