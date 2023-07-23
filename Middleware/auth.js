const jwt = require("jsonwebtoken");
const Client = require("../models/users");

const verify = async (req, res, next) => {
  try {
    const {
      body,
      cookies: { ltk: token },
    } = req;

    if (!token || typeof token !== "string")
      throw new Error(
        JSON.stringify({ status: 403, message: "some error occured" })
      );

    const { _id } = jwt.verify(token, process.env.SECRET_KEY) || {};

    if (!_id)
      throw new Error(
        JSON.stringify({ status: 403, message: "some error occured" })
      );

    const isuser = await Client.findOne({ _id, "tokens.token": token })
      .then((res) => {
        return res;
      })
      .catch((err) => {
        throw new Error(
          JSON.stringify({ status: 403, message: "user not found" })
        );
      });
    req.token = token;
    req.user = isuser;
    req.body = body;
    next();
  } catch (err) {
    next();
  }
};
module.exports = verify;
