module.exports = (sequelize, DataTypes) => {
  const AuthToken = sequelize.define(
    "AuthToken",
    {
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {}
  );

  AuthToken.associate = function ({ User }) {
    AuthToken.belongsTo(User);
  };

  return AuthToken;
};
