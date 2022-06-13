import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";
import { timestamp } from "rxjs";

const Sessions = sequelize.define(
  "Sessions",
  {
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
  },
  { timestamps: false }
);

export default Sessions;
