import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../database/startDB.js";

const Temporary2FATokens = sequelize.define("Sessions", {
  id: {
    type: DataTypes.INTEGER,
    references: {
      model: "Users",
      key: "id",
    },
    allowNull: false,
    primaryKey: true,
  },
  token: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },

  expire: {
    type: "TIMESTAMP",
    allowNull: false,
  },
});

export default Temporary2FATokens;
