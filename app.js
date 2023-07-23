// === === essentials === === //
require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.static("./public"));
const router = require("./routers/router");
const api = require("./routers/api");
const hbs = require("hbs");
require("./database/conn");
const cookie_par = require("cookie-parser");
app.use(cookie_par());
const verify = require("./Middleware/auth");

// === === view engine === === //
app.set("view engine", "hbs");
app.set("views", "./template/views");
hbs.registerPartials("./template/partials");
// === === static files === === //

// === === routers === === //
app.use("/api/addproduct", express.json({ limit: "20mb" }));
app.use(express.json());
app.use(router);

app.use("/api", api);

// === === error page === === //

app.get("*", verify, (req, res) => {
  if (req.user) {
    res.render("404", {
      name: req.user.name,
      logind: false,
      login: true,
      listing: req.user.type === "admin" ? true : false,
    });
  } else {
    res.render("404", {
      name: "login",
      logind: true,
      login: false,
    });
  }
});

// === === final call === === //

app.listen(4000, (err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log("listining to port 4000");
  }
});
