const passportJWT = require("passport-jwt");

let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;
let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = process.env.JWT_SECRET_KEY;

let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
  const { username } = jwt_payload;

  if (username) {
    next(null, jwt_payload);
  } else {
    next(null, false);
  }
});

module.exports = strategy;
