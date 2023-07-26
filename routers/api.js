const express = require("express");
const {
  register_user,
  login_user,
  client_logout,
  client_contact,
  admin_addtour,
  client_oauth,
  client_inquiry,
  client_veremail,
  client_resetotp,
  client_verify_email_otp,
} = require("../contoroller/controller");
const router = express.Router();
const verify = require("../Middleware/auth");

router.get("/", (req, res) => {
  res.send("welcome to api");
});

router.get(`/auth/google/callback`, client_oauth);

router.post("/signup", register_user);

router.post("/login", login_user);

router.get("/user", verify, (req, res) => {
  try {
    const name = {
      name: req.user.name,
      email: req.user.email,
    };
    res.send(name);
  } catch (error) {
    return res.status(403).json({
      result: false,
      message: "Unauthorized: either invalid or no token provided",
    });
  }
});

router.get("/logout", verify, client_logout);

router.post("/contact", verify, client_contact);

router.post("/addproduct", verify, admin_addtour);

router.post("/tours/:any/inquiry", verify, client_inquiry);

router.get("/resend/email/verification", verify, client_veremail);

router.post("/resend/password/reset", client_resetotp);

router.post("/email/validate", verify, client_verify_email_otp);

module.exports = router;
