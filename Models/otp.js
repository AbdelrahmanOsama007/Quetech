const { define, DataTypes } = require("sequelize");
const sequelize = require("../Config/database"); // Adjust path if necessary
const User = require("./user");
const Otp = sequelize.define(
  "otp",
  {
    otp_text: {
      type: DataTypes.STRING,
      validate: {
        len: [4, 4],
      },
      primaryKey: true,
    },
  },
  { timestamps: true }
);

User.hasMany(Otp, {
  foreignKey: "userId",
  as: "otps",
});
Otp.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

module.exports = Otp;
