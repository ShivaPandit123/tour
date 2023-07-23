const express = require("express");
const routers = express.Router();
const tours = require("../models/tours");
const verify = require("../Middleware/auth");
const querystring = require("querystring");
const Booking = require("../models/booking");

function getGoogleAuthURL() {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: process.env.GOOGLE_CALLBACK,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  return `${rootUrl}?${querystring.stringify(options)}`;
}

routers.get("/oauth/google", verify, (req, res) => {
  if (req.user) {
    res.render("404", {
      name: req.user.name,
      logind: false,
      login: true,
      listing: req.user.type === "admin" ? true : false,
    });
  } else {
    res.redirect(getGoogleAuthURL());
  }
});

routers.get("/", verify, async (req, res) => {
  try {
    let istour = await tours
      .find()
      .limit(8)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        throw new Error(
          JSON.stringify({ status: 404, message: "page not found" })
        );
      });
    let data = istour.map((itm) => {
      return {
        ...itm,
        url: itm.title.replace(" ", "-"),
      };
    });
    istour = data;
    if (req.user) {
      res.render("index", {
        name:
          req.user.name.length > 12
            ? req.user.name.slice(0, 10) + ".."
            : req.user.name,
        logind: false,
        login: true,
        listing: req.user.type === "admin" ? true : false,
        tours: istour,
      });
    } else {
      res.render("index", {
        name: "login",
        logind: true,
        login: false,
        tours: istour,
      });
    }
  } catch (error) {
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
  }
});

routers.get("/login", verify, (req, res) => {
  if (req.user) {
    res.redirect("/");
    return;
  }
  res.render("login", {
    name: "Signup",
    logind: true,
    login: false,
  });
});

routers.get("/signup", verify, (req, res) => {
  if (req.user) {
    res.redirect("/");
    return;
  }
  res.render("signup", {
    name: "Login",
    logind: true,
    login: false,
  });
});

routers.get("/dashboard", verify, (req, res) => {
  if (req.user) {
    res.render("dashboard", {
      name:
        req.user.name.length > 12
          ? req.user.name.slice(0, 10) + ".."
          : req.user.name,
      namee: req.user.name,
      logind: false,
      login: true,
      dashboard: true,
      listing: req.user.type === "admin" ? true : false,
    });
  } else {
    res.redirect("/");
  }
});

routers.get("/orders", verify, async (req, res) => {
  try {
    if (req.user) {
      let regex = new RegExp(["^", req.user.email, "$"].join(""), "i");
      const inquiry = await Booking.find({ email: regex })
        .then((res) => {
          return res;
        })
        .catch((err) => {
          throw new Error(
            JSON.stringify({ status: 500, message: "some error occured" })
          );
        });
      res.render("orders", {
        name:
          req.user.name.length > 12
            ? req.user.name.slice(0, 10) + ".."
            : req.user.name,
        logind: false,
        login: true,
        orders: true,
        listing: req.user.type === "admin" ? true : false,
        booking: inquiry,
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.redirect("/");
  }
});

routers.get("/privacy-policy", verify, (req, res) => {
  if (req.user) {
    res.render("privacy", {
      name:
        req.user.name.length > 12
          ? req.user.name.slice(0, 10) + ".."
          : req.user.name,
      logind: false,
      login: true,
      listing: req.user.type === "admin" ? true : false,
    });
  } else {
    res.render("privacy", {
      name: "login",
      logind: true,
      login: false,
    });
  }
});
routers.get("/contact", verify, (req, res) => {
  if (req.user) {
    res.render("contactus", {
      name:
        req.user.name.length > 12
          ? req.user.name.slice(0, 10) + ".."
          : req.user.name,
      namee: req.user.name,
      phone: req.user.phone,
      email: req.user.email,
      logind: false,
      login: true,
      listing: req.user.type === "admin" ? true : false,
    });
  } else {
    res.render("contactus", {
      name: "login",
      logind: true,
      login: false,
    });
  }
});
routers.get("/addproduct", verify, (req, res) => {
  if (req.user) {
    if (req.user.type === "admin") {
      res.render("pf", {
        name: req.user.name,
        logind: false,
        login: true,
        listing: req.user.type === "admin" ? true : false,
      });
    }
  } else {
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
  }
});

routers.get("/tours/:any", verify, async (req, res) => {
  const pageParam = req.params.any;
  const pageRegex = /^page(\d+)$/; // Regular expression to match "page" followed by one or more digits

  const matches = pageParam.match(pageRegex);
  try {
    if (matches) {
      const pageNumber = matches[1];
      let istour = await tours
        .find()
        .limit(12)
        .skip((pageNumber - 1) * 12)
        .then((res) => {
          return res;
        })
        .catch((err) => {
          throw new Error(
            JSON.stringify({ status: 404, message: "page not found" })
          );
        });
      if (istour.length < 1) {
        throw new Error(
          JSON.stringify({ status: 404, message: "page not found" })
        );
      }
      let data = istour.map((itm) => {
        return {
          ...itm,
          url: itm.title.replace(" ", "-"),
        };
      });
      istour = data;
      if (req.user) {
        res.render("tours", {
          name:
            req.user.name.length > 12
              ? req.user.name.slice(0, 10) + ".."
              : req.user.name,
          logind: false,
          login: true,
          listing: req.user.type === "admin" ? true : false,
          tours: istour,
        });
      } else {
        res.render("tours", {
          name: "login",
          logind: true,
          login: false,
          tours: istour,
        });
      }
    } else {
      throw new Error(
        JSON.stringify({ status: 404, message: "Page not found" })
      );
    }
  } catch (error) {
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
  }
});

routers.get("/tours", verify, async (req, res) => {
  try {
    let istour = await tours
      .find()
      .limit(12)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        throw new Error(
          JSON.stringify({ status: 404, message: "page not found" })
        );
      });
    if (istour.length < 1) {
      throw new Error(
        JSON.stringify({ status: 404, message: "page not found" })
      );
    }
    let data = istour.map((itm) => {
      return {
        ...itm,
        url: itm.title.replace(" ", "-"),
      };
    });
    istour = data;
    if (req.user) {
      res.render("tours", {
        name:
          req.user.name.length > 12
            ? req.user.name.slice(0, 10) + ".."
            : req.user.name,
        logind: false,
        login: true,
        listing: req.user.type === "admin" ? true : false,
        tours: istour,
      });
    } else {
      res.render("tours", {
        name: "login",
        logind: true,
        login: false,
        tours: istour,
      });
    }
  } catch (error) {
    console.log(error);
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
  }
});

routers.get("/tours/details/:any", verify, async (req, res) => {
  try {
    const titl = req.params.any.replace("-", " ");
    let regex = new RegExp(["^", titl, "$"].join(""), "i");
    let istour = await tours
      .findOne({ title: regex })
      .then((res) => {
        return res;
      })
      .catch((err) => {
        throw new Error(
          JSON.stringify({ status: 404, message: "page not found" })
        );
      });
    if (!istour) {
      throw new Error(
        JSON.stringify({ status: 404, message: "page not found" })
      );
    }
    let iti = istour.itinerary;
    let f = [];
    iti.forEach((element, i) => {
      f[i] = {
        title: element.title,
        description: element.description,
        count: i + 1,
      };
    });
    if (req.user) {
      res.render("stour", {
        name:
          req.user.name.length > 12
            ? req.user.name.slice(0, 10) + ".."
            : req.user.name,
        namee: req.user.name,
        phone: req.user.phone,
        email: req.user.email,
        logind: false,
        login: true,
        listing: req.user.type === "admin" ? true : false,
        tour: istour,
        iti: f,
      });
    } else {
      res.render("stour", {
        name: "login",
        logind: true,
        login: false,
        tour: istour,
        iti: f,
      });
    }
  } catch (error) {
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
  }
});

routers.get("/tours/details/:any/inquiry", verify, async (req, res) => {
  try {
    const titl = req.params.any.replace("-", " ");
    let regex = new RegExp(["^", titl, "$"].join(""), "i");
    let istour = await tours
      .findOne({ title: regex })
      .then((res) => {
        return res;
      })
      .catch((err) => {
        throw new Error(
          JSON.stringify({ status: 404, message: "page not found" })
        );
      });
    if (!istour) {
      throw new Error(
        JSON.stringify({ status: 404, message: "page not found" })
      );
    }
    let data = { ...istour._doc, image: istour.images[0].url };
    if (req.user) {
      res.render("inquiry", {
        name:
          req.user.name.length > 12
            ? req.user.name.slice(0, 10) + ".."
            : req.user.name,
        namee: req.user.name,
        phone: req.user.phone,
        email: req.user.email,
        logind: false,
        login: true,
        listing: req.user.type === "admin" ? true : false,
        tour: data,
      });
    } else {
      res.render("inquiry", {
        name: "login",
        logind: true,
        login: false,
        tour: data,
      });
    }
  } catch (error) {}
});
module.exports = routers;
