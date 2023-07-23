const mongoose = require("mongoose");
const DB = process.env.DATABASE;
mongoose
  .connect(DB)
  .then((res) => {
    console.log("Connected to Database");
  })
  .catch((err) => {
    console.log(err);
  });
