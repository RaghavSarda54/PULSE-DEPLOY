const express = require("express");
const connectDB = require("./db");
const axios = require("axios");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const app = express();
const port = 8000;
const cors = require("cors");
const User = require("./models/UserModel");
const FormUser = require("./models/FormUserSchema");
// const ComplaintSave = require("./routes/ComplaintSave");
const bodyParser = require("body-parser");

connectDB();
app.use(express.json());

// Enable CORS middleware
// app.use(cors({credentials: true, origin: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// const CookieSession= require('cookie-session');
require("dotenv").config();
// Enable CORS middleware (optional)

var cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "mysession",
    maxAge: 24 * 60 * 60 * 1000,
    keys: ["secret1", "secret2"],
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true"); // Add this lin
  next();
});

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.CLIENT_ID,
//       clientSecret: process.env.CLIENT_SECRET,
//       callbackURL: '/auth/google/callback',
//     },
//     (accessToken, refreshToken, profile, done) => {
//       // Here, you can handle the user profile data returned by Google
//       // and save it to your database or perform any other necessary actions.
//       console.log(profile);
//       done(null, profile);
//     }
//   )
// );
passport.use(
  "signup",
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/auth/google/signup/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      // Check if the user already exists in your database
      const existingUser = await User.findOne({ id: profile.id });
      const existingformUser = await FormUser.findOne({ id: profile.id });
      if (existingUser || existingformUser) {
        // User already exists, handle accordingly
        console.log(existingUser);
        return done(null, false, {
          message: "User already exists. Please log in.",
        });
      }
      // User does not exist, create a new user record in your database
      const newUser = new User({
        email: profile.emails[0].value,
        id: profile.id,
        // Additional user properties
      });
      newUser.save().then((newuser) => {
        console.log("User Saved");
      });
      return done(null, profile);
    }
  )
);

passport.use(
  "login",
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/auth/google/login/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      // Check if the user already exists in your database
      const existingUser = await User.findOne({ id: profile.id });
      const existingformUser = await FormUser.findOne({ id: profile.id });
      if (!existingUser && !existingformUser) {
        // User does not exist, handle accordingly
        return done(null, false, { message: "User not found" });
        // return done(new Error('Authentication failed. Invalid user.'), false);
      }
      // User exists, proceed with sign in
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  // console.log(user.id);
  done(null, user);
});
passport.deserializeUser((user, done) => {
  console.log(user);
  done(null, user);
});
app.get("/check", function checkIsloggedIn(req, res, next) {
  // console.log(req.user);
  // console.log(req.session);
  const isLoggedin = req.isAuthenticated() && req.user;
  const issloggedin2 = req.session.user;
  if (!isLoggedin && !issloggedin2) {
    // return res.redirect('http://localhost:3000/login');
    return res.json({ status: false, data: req.user });
  }
  //  return res.redirect('http://localhost:3000/');
  return res.json({
    status: true,
    data: req.user ? req.user : req.session.user,
  });
});

app.get("/check1", function checkIsloggedIn(req, res, next) {
  // console.log(req.user);
  // console.log(req.session);
  // const isLoggedin= req.isAuthenticated() && req.user;
  const issloggedin2 = req.session.admin;
  if (!issloggedin2) {
    // return res.redirect('http://localhost:3000/login');
    return res.json({ status: false, data: req.session.admin });
  }
  //  return res.redirect('http://localhost:3000/');
  return res.json({ status: true, data: req.session.admin });
});
// Routes
app.get(
  "/auth/google/login",
  passport.authenticate("login", {
    scope: ["profile", "email"],
    failureFlash: true,
  })
);

app.get(
  "/auth/google/login/callback",
  passport.authenticate("login", {
    failureRedirect: "http://localhost:3000/login?error=User%20not%20found",
    successRedirect: "http://localhost:3000/",
    session: true,
  }),
  (req, res) => {
    // Redirect or respond with a success message
    // res.redirect('http://localhost:3000/');
    console.log("google called us back");
  }
);

app.get(
  "/auth/google/signup",
  passport.authenticate("signup", {
    scope: ["profile", "email"],
    failureFlash: true,
  })
);

app.get(
  "/auth/google/signup/callback",
  passport.authenticate("signup", {
    failureRedirect: "http://localhost:3000/register?error=User%20exists",
    successRedirect: "http://localhost:3000/login",
    session: true,
  }),
  (req, res) => {
    // Redirect or respond with a success message
    // res.redirect('http://localhost:3000/');
    console.log("google called us back");
  }
);
app.get("/logout", (req, res) => {
  res.session = null;
  req.logout(); // Passport.js method to clear the user's session
  res.redirect("http://localhost:3000/login"); // Redirect the user to the desired logout confirmation page
});

///api/data it can be any path we want to give just that it needs to be the same at both front and backend
// Define your API endpoint
app.get("/api/data", async (req, res) => {
  try {
    const latitude = req.query.lat;
    const longitude = req.query.lng;
    const radius = req.query.radius;
    // const apiKey = req.query.apiKey;

    if (!latitude || !longitude || !radius) {
      return res
        .status(400)
        .json({ error: "Latitude, longitude, and radius are required" });
    }

    // const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=police&key=${apiKey}`;
    const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=police&key=AIzaSyAAMW0mDCp5S_BI-q7XYSikiUIJJwZt7Ig`;
    // Replace 'YOUR_API_KEY' with your actual Google Maps API key

    // Make a request to the external API using the provided URL
    const response = await axios.get(apiUrl);
    const responseData = response.data;
    // Send the response back to the frontend
    res.json(responseData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.get("/", async (req, res) => {
  res.send("Hello");
});
app.use("/admin", require("./routes/Admin"));
// app.use("/api", require("./routes/ComplaintSave"));
app.use("/api", require("./routes/CoordinatesSave"));
app.use("/login", require("./routes/login"));
app.use("/register", require("./routes/register"));

// app.use("/api/submission/complaint", ComplaintSave);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
