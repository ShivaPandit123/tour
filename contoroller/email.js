const axios = require("axios");
const otp = require("../models/otp");
const Otp = require("../models/otp");
function generateOTP() {
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}
exports.send_otp = async (user, type) => {
  try {
    const { email, name } = user;
    let code;
    let regex = new RegExp(["^", email, "$"].join(""), "i");
    const isotp = await Otp.findOne({ email: regex, type })
      .then((res) => res)
      .catch((err) => {
        throw new Error(
          JSON.stringify({ status: 500, message: "Some error occured" })
        );
      });
    if (isotp) {
      const validity = new Date(isotp.validity);
      if (validity.getTime() - new Date().getTime() < 60000) {
        const delotp = await otp
          .deleteMany({ email: regex, type })
          .then((res) => res)
          .catch((err) => {
            throw new Error(
              JSON.stringify({ status: 500, message: "some error occured" })
            );
          });
        code = generateOTP();
        let time = Date.now();
        const otp_data = new otp({
          type: type,
          email,
          date: time,
          validity: time + 600000,
          code,
        });
        const result = await otp_data
          .save()
          .then((res) => {
            return res;
          })
          .catch((err) => {
            throw new Error(
              JSON.stringify({ status: 500, message: "Some error occured" })
            );
          });
      } else {
        if (isotp.resend) {
          if (isotp.resend.count > 5) {
            throw new Error(
              JSON.stringify({
                status: 400,
                message: "Many otp sent in last 10 min try again in some time",
              })
            );
          } else if (
            new Date().getTime() - new Date(isotp.resend.on).getTime() <
            60000
          ) {
            throw new Error(
              JSON.stringify({
                status: 200,
                message: "OTP was resent successfully.",
              })
            );
          }
        }
        code = isotp.code;
        let resend = {
          count: isotp.resend.count ? isotp.resend.count + 1 : 1,
          on: Date.now(),
        };
        const otp_upd = await otp
          .updateOne({ email: regex, type }, { resend })
          .then((res) => {
            return res;
          })
          .catch((err) => {
            throw new Error(
              JSON.stringify({ status: 500, message: "Some error occured" })
            );
          });
      }
    } else {
      code = generateOTP();
      let time = Date.now();
      const otp_data = new otp({
        type: type,
        email,
        date: time,
        validity: time + 600000,
        code,
      });
      const result = await otp_data
        .save()
        .then((res) => {
          return res;
        })
        .catch((err) => {
          throw new Error(
            JSON.stringify({ status: 500, message: "Some error occured" })
          );
        });
    }
    const data = {
      to: [
        {
          name: name,
          email: email,
        },
      ],
      from: {
        name: "VM Tour Package",
        email: "service@vrindavanmathuratourpackage.com",
      },
      domain: "vrindavanmathuratourpackage.com",
      mail_type_id: "1",
      reply_to: [
        {
          email: "info@vrindavanmathuratourpackage.com",
        },
      ],
      template_id:
        type === "verify" ? "vm_email_verification" : "vm_reset_pass",
      variables: {
        OTP: code,
      },
    };
    const customConfig = {
      headers: {
        "Content-Type": "application/JSON",
        Accept: "application/json",
        authkey: process.env.MSG91,
      },
    };
    let emailre = await axios
      .post("https://api.msg91.com/api/v5/email/send", data, customConfig)
      .then((res) => {
        return res;
      })
      .catch((error) => {
        throw new Error(
          JSON.stringify({ status: 500, message: "Some error occured" })
        );
      });
    return { result: true };
  } catch (error) {
    const err = JSON.parse(error.message);
    return {
      result: err.status === 200 ? true : false,
      message: err.message,
      status: err.status,
    };
  }
};
