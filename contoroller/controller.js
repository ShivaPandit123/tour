const validator = require("validator");
const uniqid = require("uniqid");
const bcrypt = require("bcryptjs");
const contact = require("../models/contact");
const fs = require("fs");
const mime = require("mime-types");
const tours = require("../models/tours");
const users = require("../models/users");
const path = require("path");
const axios = require("axios");
const querystring = require("querystring");
const Booking = require("../models/booking");
const { send_otp } = require("./email");
const Otp = require("../models/otp");
exports.register_user = async (req, res) => {
  try {
    const { email, phone, password, cpassword, name } = req.body;
    if (!name || !email || !phone || !password || !cpassword) {
      throw new Error(
        JSON.stringify({ status: 400, message: "all fields are required" })
      );
    }
    if (!validator.isEmail(email)) {
      throw new Error(
        JSON.stringify({ status: 400, message: "Please enter a valid email" })
      );
    } else if (password !== cpassword) {
      throw new Error(
        JSON.stringify({
          status: 400,
          message: "Both password must be identical",
        })
      );
    } else if (!validator.isStrongPassword(password)) {
      throw new Error(
        JSON.stringify({
          status: 400,
          message: "Please enter a strong password",
        })
      );
    } else if (!validator.isMobilePhone(phone, "en-IN")) {
      throw new Error(
        JSON.stringify({
          status: 400,
          message: "Please enter a valip phone number",
        })
      );
    } else if (typeof name !== "string" || name.length > 100) {
      throw new Error(
        JSON.stringify({
          status: 400,
          message: "Please enter a valip name",
        })
      );
    }
    let id = uniqid();
    const client = new users({
      id,
      email,
      phone,
      password,
      name,
      type: "client",
      isverified: false,
      verification: {
        email: false,
      },
    });
    const result = await client
      .save()
      .then(() => {
        return res;
      })
      .catch((err) => {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: err.message,
          })
        );
      });
    const token = await client
      .genrateAuthToken()
      .then((res) => {
        return res;
      })
      .catch((error) => {
        throw new Error(
          JSON.stringify({ status: 400, message: "Some error occured" })
        );
      });
    return res
      .status(200)
      .cookie("ltk", token, {
        expires: new Date(Date.now() + 432000000),
        httpOnly: true,
      })
      .json({ result: true, message: "Account Created" });
  } catch (error) {
    const err = JSON.parse(error.message);
    return res.status(err.status).json({
      result: false,
      message: err.message,
    });
  }
};

// === === === login === === === //

exports.login_user = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error(
        JSON.stringify({ status: 400, message: "all fields are required" })
      );
    }
    if (!validator.isEmail(email)) {
      throw new Error(
        JSON.stringify({ status: 400, message: "invalid email" })
      );
    } else if (!validator.isStrongPassword(password)) {
      throw new Error(
        JSON.stringify({ status: 400, message: "invalid password" })
      );
    }
    let regex = new RegExp(["^", email, "$"].join(""), "i");
    const isuser = await users
      .findOne(
        { email: regex },
        { _id: 1, name: 1, password: 1, email: 1, tokens: 1 }
      )
      .then((res) => res)
      .catch((err) => {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: "Please check your email or password",
          })
        );
      });
    if (bcrypt.compare(password, isuser.password)) {
      const token = await isuser
        .genrateAuthToken()
        .then((res) => {
          return res;
        })
        .catch((error) => {
          throw new Error(
            JSON.stringify({ status: 400, message: "Some error occured" })
          );
        });
      return res
        .status(200)
        .cookie("ltk", token, {
          expires: new Date(Date.now() + 432000000),
          httpOnly: true,
        })
        .json({
          result: true,
          message: "login successful",
        });
    } else {
      throw new Error(
        JSON.stringify({
          status: 400,
          message: "Please check your email or password",
        })
      );
    }
  } catch (error) {
    const err = JSON.parse(error.message);
    return res.status(err.status).json({
      result: false,
      message: err.message,
    });
  }
};

exports.client_logout = async (req, res) => {
  try {
    const token = req.user.tokens;
    const filtered = token.filter((itm) => {
      return itm.token !== req.token;
    });
    const dt = await Client.updateOne(
      { email: req.user.email },
      { tokens: filtered }
    )
      .then((re) => {
        res
          .clearCookie("ltk")
          .json({ result: true, message: "logged out successfully" });
      })
      .catch((error) => {
        res
          .clearCookie("ltk")
          .json({ result: true, message: "logged out successfully" });
      });
  } catch (error) {
    res
      .clearCookie("ltk")
      .json({ result: true, message: "logged out successfully" });
  }
};

exports.client_contact = async (req, res) => {
  try {
    const { email, phone, name, message, typ } = req.body;
    if (!typ || !["cnt", "lts"].some((itm) => itm == typ)) {
      throw new Error(
        JSON.stringify({
          status: 400,
          message: "Invalid input",
        })
      );
    }
    if (!email) {
      throw new Error(
        JSON.stringify({ status: 400, message: "please provide email" })
      );
    }
    if (req.user) {
      if (req.user.email.toLowerCase() !== email) {
        throw new Error(
          JSON.stringify({
            status: 403,
            message: "can't make request of behalf of other",
          })
        );
      }
    }
    if (!validator.isEmail(email)) {
      throw new Error(
        JSON.stringify({ status: 400, message: "Please enter a valid email" })
      );
    }
    if (typ === "cnt") {
      if (!phone || !message || !name) {
        throw new Error(
          JSON.stringify({ status: 400, message: "all field's are required" })
        );
      }
      if (!validator.isMobilePhone(phone, "en-IN")) {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: "Please enter a valip phone number",
          })
        );
      } else if (typeof message !== "string" || message.length > 1000) {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: "Invalid input",
          })
        );
      } else if (typeof name !== "string" || name.length > 100) {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: "Please enter a valip name",
          })
        );
      }
    }
    let regex = new RegExp(["^", email, "$"].join(""), "i");
    const iscontact = await contact
      .findOne({ email: regex, status: "pending", type: typ })
      .then((res) => {
        return res ? res : {};
      })
      .catch((err) => {
        return {};
      });
    if (iscontact.id) {
      throw new Error(
        JSON.stringify({
          status: 200,
          message: `Request already exist request id:- ${iscontact.id}`,
        })
      );
    }
    let id = "cnt-" + uniqid();
    const cont = new contact(
      typ === "cnt"
        ? {
            id,
            type: typ,
            email,
            name,
            message,
            phone,
            status: "pending",
          }
        : { id, type: typ, email, status: "pending" }
    );
    const result = await cont
      .save()
      .then(() => {
        return res
          .status(201)
          .json({ result: true, message: `Request created id:- ${id}` });
      })
      .catch((err) => {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: err.message,
          })
        );
      });
  } catch (error) {
    const err = JSON.parse(error.message);
    return res.status(err.status).json({
      result: false,
      message: err.message,
    });
  }
};

exports.admin_addtour = async (req, res) => {
  if (req.user.type === "admin") {
    try {
      const {
        title,
        description,
        meta,
        type,
        startp,
        duration,
        image,
        itinerary,
        addon,
        inclusion,
        exclusion,
        faq,
      } = req.body;
      if (!title) {
        throw new Error(
          JSON.stringify({ status: 400, message: "please enter the title" })
        );
      } else if (typeof title != "string") {
        throw new Error(
          JSON.stringify({ status: 400, message: "please enter a valid title" })
        );
      } else if (!description) {
        throw new Error(
          JSON.stringify({ status: 400, message: "please enter the title" })
        );
      } else if (typeof description != "string") {
        throw new Error(
          JSON.stringify({ status: 400, message: "please enter a valid title" })
        );
      } else if (!meta) {
        throw new Error(
          JSON.stringify({ status: 400, message: "please provide meta data" })
        );
      } else if (typeof meta !== "object") {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: "please provide a valid meta data",
          })
        );
      } else if (
        typeof meta.heading !== "string" ||
        typeof meta.description !== "string" ||
        typeof meta.keyword !== "string"
      ) {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: "please provide a valid meta heading and description",
          })
        );
      } else if (typeof type !== "string") {
        throw new Error(
          JSON.stringify({ status: 400, message: "Pleas enter a valid type" })
        );
      } else if (
        ![
          "Mountain tourism",
          "Religious tourism",
          "Cultural tourism",
          "Rural tourism",
        ].some((itm) => itm === type)
      ) {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: "Please enter a valid tour type",
          })
        );
      } else if (!startp) {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: "please enter the start point",
          })
        );
      } else if (typeof startp != "string" || startp.length > 35) {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: "please enter a valid start point",
          })
        );
      } else if (isNaN(duration)) {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: "please enter a valid duration",
          })
        );
      } else if (!image) {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: "please provide atleast 3 images",
          })
        );
      } else if (typeof image !== "object" || image.length < 3) {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: "please provide atleast 3 images",
          })
        );
      } else if (!itinerary) {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: "please provide itinerary",
          })
        );
      } else if (
        typeof itinerary !== "object" ||
        itinerary.length != duration
      ) {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: "please provide itinerary for selected duration",
          })
        );
      } else if (!faq) {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: "please provide some FAQ",
          })
        );
      } else if (typeof faq !== "object" || faq.length < 1) {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: "please provide some FAQ",
          })
        );
      }

      itinerary.forEach((element) => {
        if (!element.title || !element.description) {
          throw new Error(
            JSON.stringify({
              status: 400,
              message: "please input title and description for day itinerary",
            })
          );
        } else if (
          typeof element.title !== "string" ||
          typeof element.description !== "string"
        ) {
          throw new Error(
            JSON.stringify({
              status: 400,
              message:
                "please input valid title and description for day itinerary",
            })
          );
        }
      });
      faq.forEach((element) => {
        if (!element.title || !element.description) {
          throw new Error(
            JSON.stringify({
              status: 400,
              message: "please input title and description for FAQ",
            })
          );
        } else if (
          typeof element.title !== "string" ||
          typeof element.description !== "string"
        ) {
          throw new Error(
            JSON.stringify({
              status: 400,
              message: "please input valid title and description for FAQ",
            })
          );
        }
      });

      inclusion.forEach((element) => {
        if (!element.description) {
          throw new Error(
            JSON.stringify({
              status: 400,
              message: "please input description for inclusion",
            })
          );
        } else if (typeof element.description !== "string") {
          throw new Error(
            JSON.stringify({
              status: 400,
              message: "please input valid description for inclusion",
            })
          );
        }
      });

      exclusion.forEach((element) => {
        if (!element.description) {
          throw new Error(
            JSON.stringify({
              status: 400,
              message: "please input description for exclusion",
            })
          );
        } else if (typeof element.description !== "string") {
          throw new Error(
            JSON.stringify({
              status: 400,
              message: "please input valid description for exclusion",
            })
          );
        }
      });

      addon.forEach((element) => {
        if (!element.product) {
          throw new Error(
            JSON.stringify({
              status: 400,
              message: "please input product for addon",
            })
          );
        } else if (typeof element.product !== "string") {
          throw new Error(
            JSON.stringify({
              status: 400,
              message: "please input valid product for addon",
            })
          );
        }
      });
      // === === === saving images === === === //

      let id = uniqid();

      // Function to validate if a data URL is an image
      function isDataUrlImage(dataUrl) {
        const mimeType = dataUrl.match(/data:(.*);base64/)[1];
        return mimeType.startsWith("image/");
      }

      // Function to convert a data URL into a file and save it
      function convertDataUrlToImage(dataUrl, fileName, savePath) {
        const imageBuffer = Buffer.from(dataUrl.split(",")[1], "base64");
        const mimeType = dataUrl.match(/^data:(.+);base64/)[1];
        const extension = mime.extension(mimeType);
        const filePath = path.join(savePath, `${fileName}.${extension}`);
        fs.writeFileSync(filePath, imageBuffer);
        return `${fileName}.${extension}`;
      }
      const saveLocation = path.join(__dirname, `../public/assets/tours/${id}`);
      const images = [];

      fs.mkdirSync(saveLocation, { recursive: true });

      // Iterate through the data URLs and process each one
      image.forEach((dataUrl, index) => {
        if (isDataUrlImage(dataUrl)) {
          const imagePath = convertDataUrlToImage(
            dataUrl,
            uniqid(),
            saveLocation
          );
          images.push({ url: imagePath });
        } else {
          console.log(`Data URL at index ${index} is not an image.`);
        }
      });
      const tourdt = new tours({
        id,
        title,
        description,
        meta,
        type,
        startp,
        duration,
        images,
        itinerary,
        addon,
        inclusion,
        exclusion,
        faq,
      });
      const result = await tourdt
        .save()
        .then(() => {
          return res.status(201).json({ result: true, message: `tour listed` });
        })
        .catch((err) => {
          throw new Error(
            JSON.stringify({
              status: 400,
              message: err.message,
            })
          );
        });
    } catch (error) {
      const err = JSON.parse(error.message);
      return res.status(err.status).json({
        result: false,
        message: err.message,
      });
    }
  } else {
    res.status(400).send(`<!DOCTYPE html>
    <html lang="en">
    
    <head>
      <meta charset="utf-8">
      <title>Error</title>
    </head>
    
    <body>
      <pre>Cannot POST /api/addproduct</pre>
    </body>
    
    </html>`);
  }
};

function getTokens({ code, clientId, clientSecret, redirectUri }) {
  const url = "https://oauth2.googleapis.com/token";
  const values = {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  };

  return axios
    .post(url, querystring.stringify(values), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((res) => res.data)
    .catch((error) => {
      console.error("Failed to fetch auth tokens");
      throw new Error(error.message);
    });
}
function generateStrongPassword(length) {
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const numberChars = "0123456789";
  const specialChars = "!@#$%^&*()-_=+[]{}|;:',.<>?";

  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allChars.length);
    password += allChars[randomIndex];
  }

  return password;
}
exports.client_oauth = async (req, res) => {
  const code = req.query.code;

  try {
    const { id_token, access_token } = await getTokens({
      code,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_CALLBACK,
    });

    const googleUser = await axios
      .get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
        {
          headers: {
            Authorization: `Bearer ${id_token}`,
          },
        }
      )
      .then((res) => res.data)
      .catch((error) => {
        console.error("Failed to fetch user");
        throw new Error(error.message);
      });
    let regex = new RegExp(["^", googleUser.email, "$"].join(""), "i");
    const isuser = await users
      .findOne({ email: regex })
      .then((res) => res)
      .catch((err) => {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: "some error occured",
          })
        );
      });
    if (isuser) {
      if (!isuser.isverified) {
        const update = await users
          .updateOne(
            { email: regex },
            {
              isverified: true,
              verification: {
                email: true,
              },
              password: generateStrongPassword(9),
            }
          )
          .then((res) => res)
          .catch((err) => {});
      }
      const token = await isuser
        .genrateAuthToken()
        .then((res) => {
          return res;
        })
        .catch((error) => {
          throw new Error(
            JSON.stringify({ status: 400, message: "Some error occured" })
          );
        });
      return res
        .status(200)
        .cookie("ltk", token, {
          expires: new Date(Date.now() + 432000000),
          httpOnly: true,
        })
        .redirect("/");
    } else {
      let id = uniqid();
      const client = new users({
        id,
        email: googleUser.email,
        password: generateStrongPassword(9),
        name: googleUser.name,
        type: "client",
        isverified: true,
        verification: {
          email: true,
        },
      });
      const result = await client
        .save()
        .then(() => {
          return res;
        })
        .catch((err) => {
          throw new Error(
            JSON.stringify({
              status: 400,
              message: err.message,
            })
          );
        });
      const token = await client
        .genrateAuthToken()
        .then((res) => {
          return res;
        })
        .catch((error) => {
          throw new Error(
            JSON.stringify({ status: 400, message: "Some error occured" })
          );
        });
      return res
        .status(200)
        .cookie("ltk", token, {
          expires: new Date(Date.now() + 432000000),
          httpOnly: true,
        })
        .redirect("/");
    }
  } catch (error) {
    console.error("Error during authentication:", error.message);
    res.status(500).send("some error occured");
  }
};
function isValidGSTNumber(gstNumber) {
  const gstRegex =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;

  return gstRegex.test(gstNumber);
}
function isValidDateRange(dateRange) {
  const dateRangeRegex = /^\d{4}-\d{2}-\d{2}\s+to\s+\d{4}-\d{2}-\d{2}$/;
  if (!dateRangeRegex.test(dateRange)) {
    return false; // Format doesn't match "YYYY-MM-DD to YYYY-MM-DD"
  }

  const [startDateStr, endDateStr] = dateRange.split(" to ");
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (isNaN(startDate) || isNaN(endDate)) {
    return false; // Invalid date format
  }

  if (startDate >= endDate) {
    return false; // Start date should be before end date
  }

  return true;
}
function isValidMemberInput(memberCount, memberConfig) {
  // Validate memberCount is a positive integer
  const countRegex = /^\d+$/;
  if (!countRegex.test(memberCount)) {
    return false;
  }

  // Parse memberCount to an integer
  const parsedCount = parseInt(memberCount, 10);

  // Validate memberCount is greater than zero and less than equal to 56
  if (parsedCount <= 0 || parsedCount > 56) {
    return false;
  }

  // Validate memberConfig format
  const configRegex = /^(\d+\s[A-Za-z]+\s*,\s*)*\d+\s[A-Za-z]+$/;
  if (!configRegex.test(memberConfig)) {
    return false;
  }

  // Validate memberConfig matches the memberCount
  const members = memberConfig
    .split(",")
    .map((member) => member.trim().split(" "));
  const totalMembers = members.reduce(
    (total, [count]) => total + parseInt(count, 10),
    0
  );

  return parsedCount === totalMembers;
}
function isString(input) {
  return typeof input === "string";
}
function getPackageNameFromURL(ur) {
  const packageNameWithDash = ur;
  const packageName = packageNameWithDash.split("-").join(" ");
  return packageName;
}
exports.client_inquiry = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      gst,
      note,
      addon,
      date,
      member,
      tour,
      traveller,
    } = req.body;
    const urlPackageName = getPackageNameFromURL(req.params.any);
    if (!validator.isEmail(email)) {
      throw new Error(
        JSON.stringify({
          status: 400,
          message: "Please enter a valid email",
        })
      );
    } else if (!validator.isMobilePhone(phone, "en-IN")) {
      throw new Error(
        JSON.stringify({
          status: 400,
          message: "Please enter a valid phone number",
        })
      );
    } else if (name.length > 100) {
      throw new Error(
        JSON.stringify({
          status: 400,
          message: "Name can't be greater than 100 characters",
        })
      );
    } else if (gst) {
      if (!isValidGSTNumber(gst)) {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: "Please enter a valid GST number",
          })
        );
      }
    } else if (!isValidDateRange(date)) {
      throw new Error(
        JSON.stringify({
          status: 400,
          message: "Invalid date range selected",
        })
      );
    } else if (!isValidMemberInput(member, traveller)) {
      throw new Error(
        JSON.stringify({
          status: 400,
          message: "Invalid member input",
        })
      );
    } else if (tour.toLowerCase() !== urlPackageName.toLowerCase()) {
      throw new Error(
        JSON.stringify({
          status: 400,
          message: "Package name in the URL does not match",
        })
      );
    } else if (note) {
      if (!isString(note)) {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: "Invalid note",
          })
        );
      }
    } else if (addon) {
      if (!isString(addon)) {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: "Invalid addon",
          })
        );
      }
    }
    const user = req.user;
    if (user) {
      if (user.email.toLowerCase() !== email.toLowerCase()) {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: "please user your email id",
          })
        );
      }
      if (user.name.toLowerCase() !== name.toLowerCase()) {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: "please use your account name",
          })
        );
      }
    }
    let regex = new RegExp(["^", urlPackageName, "$"].join(""), "i");
    let istour = await tours
      .findOne({ title: regex })
      .then((res) => {
        return res;
      })
      .catch((err) => {
        throw new Error(
          JSON.stringify({ status: 404, message: "Tour Package Not Found" })
        );
      });
    if (!istour) {
      throw new Error(
        JSON.stringify({ status: 404, message: "Tour Package Not Found" })
      );
    }
    const id = "tour-" + uniqid();
    const bkng = new Booking({
      id,
      name,
      phone,
      email,
      status: "inquiry",
      gst,
      note,
      addon,
      expdate: date,
      member,
      tour: {
        name: istour.title,
        url: istour.title.split(" ").join("-"),
      },
      traveller,
    });
    const result = await bkng
      .save()
      .then(() => {
        return res.status(201).json({
          result: true,
          message: "Inquiry submitted we will call you shortly",
        });
      })
      .catch((err) => {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: err.message,
          })
        );
      });
  } catch (error) {
    const err = JSON.parse(error.message);
    return res.status(err.status).json({
      result: false,
      message: err.message,
    });
  }
};

exports.client_veremail = async (req, res) => {
  try {
    const { email, name } = req.user;
    if (!validator.isEmail(email)) {
      throw new Error(
        JSON.stringify({ status: 400, message: "Invalid email" })
      );
    } else if (typeof name !== "string") {
      throw new Error(JSON.stringify({ status: 400, message: "Invalid name" }));
    }
    let result = await send_otp({ email, name }, "verify");
    if (result.result) {
      res.status(200).json({ result: true, message: "Resend is successfull" });
    } else {
      res
        .status(result.status)
        .json({ result: result.result, message: result.message });
    }
  } catch (error) {
    const err = JSON.parse(error.message);
    return res.status(err.status).json({
      result: false,
      message: err.message,
    });
  }
};

exports.client_resetotp = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!validator.isEmail(email)) {
      throw new Error(
        JSON.stringify({ status: 400, message: "Invalid email" })
      );
    } else if (typeof name !== "string") {
      throw new Error(JSON.stringify({ status: 400, message: "Invalid name" }));
    }
    let result = await send_otp({ email, name }, "pswd");
    if (result.result) {
      res.status(200).json({ result: true, message: "Resend is successfull" });
    } else {
      res
        .status(result.status)
        .json({ result: result.result, message: result.message });
    }
  } catch (error) {
    const err = JSON.parse(error.message);
    return res.status(err.status).json({
      result: false,
      message: err.message,
    });
  }
};
function isOTPValid(userInput) {
  // Check if the input is a number
  if (!/^\d+$/.test(userInput)) {
    return false;
  }

  // Check if the length is exactly 6 digits
  if (userInput.length !== 6) {
    return false;
  }

  return true;
}
exports.client_verify_email_otp = async (req, res) => {
  try {
    const user = req.user;
    const { code } = req.body;
    if (!isOTPValid(code)) {
      throw new Error(
        JSON.stringify({ status: 400, message: "Please enter a valid otp" })
      );
    }
    if (!user) {
      throw new Error(
        JSON.stringify({ status: 400, message: "Invalid request" })
      );
    }
    const isotp = await Otp.findOne({ email: user.email, type: "verify" })
      .then((res) => res)
      .catch((err) => {
        throw new Error(
          JSON.stringify({ status: 500, message: "Some Error occured" })
        );
      });
    if (!isotp) {
      throw new Error(
        JSON.stringify({ status: 400, message: "Invalid request" })
      );
    } else if (isotp.code != code) {
      throw new Error(
        JSON.stringify({ status: 400, message: "Please enter a valid otp" })
      );
    } else if (new Date(isotp.validity) < Date.now()) {
      throw new Error(JSON.stringify({ status: 400, message: "OTP expired" }));
    }
    const update = await users
      .updateOne(
        { email: user.email },
        {
          isverified: true,
          verification: {
            email: true,
          },
        }
      )
      .then((res) => res)
      .catch((err) => {
        throw new Error(
          JSON.stringify({ status: 500, message: "Some Error occured" })
        );
      });
    const delotp = await Otp.deleteMany({ email: user.email, type: "verify" })
      .then((res) => res)
      .catch((err) => {});
    res.status(200).json({ result: true, message: "Email verified" });
  } catch (error) {
    const err = JSON.parse(error.message);
    return res.status(err.status).json({
      result: false,
      message: err.message,
    });
  }
};
