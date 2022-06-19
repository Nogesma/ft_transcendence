import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  ForeignKey,
} from "sequelize";

import sequelize from "../database/db.js";
import User from "./User.js";

class Session extends Model<
  InferAttributes<Session>,
  InferCreationAttributes<Session>
> {
  declare id: ForeignKey<User["id"]>;
  declare token: string;
  declare expires: Date;
}

Session.init(
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
    tableName: "Sessions",
    timestamps: false,
  }
);

export default Session;
