import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";

const Temporary2FATokens = sequelize.define(
  "Temporary2FAToken",
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

export default Temporary2FATokens;
