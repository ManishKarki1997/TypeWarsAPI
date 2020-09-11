module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      email: DataTypes.STRING,
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      avatar: DataTypes.STRING,
    },
    {}
  );
  User.associate = function (models) {
    // associations can be defined here
  };

  return User;
};
