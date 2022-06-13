import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";

const TwoFactorSecrets = sequelize.define("Sessions", {
  id: {
    type: DataTypes.INTEGER,
    references: {
      model: "Users",
      key: "id",
    },
    allowNull: false,
    primaryKey: true,
  },
  secret: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  temp: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
});

export default TwoFactorSecrets;
