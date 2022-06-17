import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import sequelize from "../database/db.js";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: number;
  declare login: string;
  declare displayname: string;
  declare tfa: boolean;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
    login: {
      type: new DataTypes.STRING(8),
      allowNull: false,
    },
    displayname: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    tfa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "Users",
    timestamps: false,
  }
);

export default User;
