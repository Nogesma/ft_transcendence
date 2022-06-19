import {
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import sequelize from "../database/db.js";
import User from "./User.js";

class TwoFactorSecret extends Model<
  InferAttributes<TwoFactorSecret>,
  InferCreationAttributes<TwoFactorSecret>
> {
  declare id: ForeignKey<User["id"]>;
  declare secret: string;
  declare temp: boolean;
}

TwoFactorSecret.init(
  {
    secret: {
      type: new DataTypes.STRING(52),
      unique: true,
      allowNull: false,
    },
    temp: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "TwoFactorSecrets",
    timestamps: false,
  }
);

export default TwoFactorSecret;
