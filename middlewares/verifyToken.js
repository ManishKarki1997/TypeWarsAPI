const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    const token = req.get("Authorization").split(" ")[1];
    req.token = token;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decodedToken;
    if (!token) {
      return res.send({
        error: true,
        errorLog: "No Authorization Header",
      });
    }
    next();
  } catch (err) {
    res.send({
      error: true,
      errorLog: "Invalid Authorization Token",
    });
  }
};
