import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";

const Sessions = sequelize.define("Sessions", {
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
  expires: {
    type: "TIMESTAMP",
    allowNull: false,
  },
});

export default Sessions;
