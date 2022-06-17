import {
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

import sequelize from "../database/db.js";
import User from "./User.js";

class Temporary2FAToken extends Model<
  InferAttributes<Temporary2FAToken>,
  InferCreationAttributes<Temporary2FAToken>
> {
  declare id: ForeignKey<User["id"]>;
  declare token: string;
  declare expires: Date;
}

Temporary2FAToken.init(
  {
    token: {
      type: new DataTypes.STRING(21),
      unique: true,
      allowNull: false,
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "Temporary2FATokens",
    timestamps: false,
  }
);

export default Temporary2FAToken;
