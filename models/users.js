const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const user = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ["client", "admin"],
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  phone: {
    type: Number,
    unique: true,
    sparse: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isverified: {
    type: Boolean,
    required: true,
  },
  verification: {
    email: {
      type: Boolean,
      required: true,
    },
  },
  Date: {
    type: Date,
    default: Date.now(),
  },
  tokens: [
    {
      token: {
        type: String,
      },
    },
  ],
});
user.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $exists: true } } }
);
user.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hashpass = await bcrypt.hash(this.password, 12);
    this.password = hashpass;
    this.cPassword = hashpass;
  }
  next();
});

user.pre("updateOne", async function (next) {
  let data = this.getUpdate();
  if (data.password) {
    const hashpass = await bcrypt.hash(data.password, 12);
    data.password = hashpass;
    data.cPassword = hashpass;
  }
  next();
});

// token
user.methods.genrateAuthToken = async function () {
  try {
    let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY, {
      expiresIn: "432000 seconds",
    });
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (err) {
    throw new Error(
      JSON.stringify({ status: 500, message: "some error occured" })
    );
  }
};
const User = new mongoose.model("user", user);
module.exports = User;
