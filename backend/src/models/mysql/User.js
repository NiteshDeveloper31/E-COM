import { DataTypes } from "sequelize";
import { sequelize } from "../../config/mysql.js";
import bcrypt from "bcryptjs";

export const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: "customer"
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "Active"
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: ["dashboard", "products", "orders"]
  }
}, {
  tableName: "users",
  hooks: {
    beforeCreate: async (user) => {
      if (user.password && !user.password.startsWith("$2a$") && !user.password.startsWith("$2b$")) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed("password") && !user.password.startsWith("$2a$") && !user.password.startsWith("$2b$")) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance method to check password
User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default User;
