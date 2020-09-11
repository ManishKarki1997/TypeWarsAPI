const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: uuidv4(),
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "https://w.wallhaven.cc/full/ox/wallhaven-oxo7e9.png",
      },
    },
    {}
  );
  User.associate = function (models) {
    // associations can be defined here
    User.hasMany(models.AuthToken);
  };

  return User;
};
