const express = require("express");
const Admin = require("../models/AdminModel");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/UserModel");
var cookieSession = require("cookie-session");
var usedNumbers = new Set();
const nodemailer = require("nodemailer");
const Coordinate = require("../models/CoordinatesModel");
const UserData = require("../models/UserDataModel");
// Create a transporter with your email service credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "pulse7561@gmail.com",
    pass: "fkfzrtomrjweslkd",
  },
});
const sendLoginEmail = async (email, adminId, password) => {
  try {
    // Create the email content
    const mailOptions = {
      from: "puneetgoyal539@gmail.com",
      to: email,
      subject: "Successful Login",
      text: `Congratulations! You have successfully logged in.\n\nYour credentials:\nAdminId: ${adminId}\nPassword: ${password}`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

router.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true"); // Add this lin
  next();
});

function generateUniqueNumber(min, max) {
  var randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  if (usedNumbers.has(randomNumber)) {
    // Number has already been generated, generate a new one recursively
    return generateUniqueNumber(min, max);
  } else {
    usedNumbers.add(randomNumber);
    return randomNumber;
  }
}

// Example usage
var number1 = generateUniqueNumber(0, 9);
console.log(number1);

var number2 = generateUniqueNumber(0, 9);
console.log(number2);

router.post("/login", async (req, res) => {
  try {
    console.log(req.body);
    const { adminId, password } = req.body;

    const existinguser = await Admin.findOne({ adminId: adminId });
    if (!existinguser) {
      return res
        .status(401)
        .json({ message: "User Does Not Exist. Please Register" });
    }
    const hashedPassword = existinguser.password;

    // Compare the entered password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, hashedPassword);

    if (passwordMatch) {
      // Passwords match, authentication successful
      req.session.admin = existinguser;
      console.log(req.session);

      return res.status(200).json({ message: "Authentication successful" });
    } else {
      // Passwords do not match, authentication failed
      return res.status(401).json({ message: "Password Does Not Match" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/register", async (req, res) => {
  try {
    // const {email, password } = req.body;

    const existinguser = await Admin.findOne({ email: req.body.email });

    if (existinguser) {
      return res.status(401).json({ message: "User Already Exists" });
    }
    const adminId = generateUniqueNumber(1000000000, 9999999999);
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newuser = new Admin({
      email: req.body.email,
      password: hashedPassword,
      latitude: req.body.lat,
      longitude: req.body.lng,
      adminId: adminId,
    });

    newuser.save().then((saveduser) => {
      sendLoginEmail("puneetgoyal539@gmail.com", adminId, req.body.password);
      return res.status(200).json({ message: "Authentication successful" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/complaints", async (req, res) => {
  try {
    const lat = req.query.lat;
    const lng = req.query.lng;
    const response = await Coordinate.findOne({
      latitude: lat,
      longitude: lng,
    });

    if (!response) {
      return res
        .status(500)
        .json({ message: "Internal server error", data: [] });
    }
    return res.status(200).json({ data: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", data: [] });
  }
});

router.post("/remark", async (req, res) => {
  const { remark, status } = req.body;
  const { latitude, longitude, id } = req.query;
  const nremark = {
    data: remark,
    date: Date.now(),
  };
  try {
    // const admin= await Coordinate.findOne({complaints:{$elemMatch:{complaintId:id}}});
    // console.log(admin);
    await Coordinate.updateMany(
      {
        latitude: latitude,
        longitude: longitude,
        "complaints.complaintId": id,
      },
      {
        $push: { "complaints.$.remarks": nremark },
        "complaints.$.status": status,
      }
    );
    await UserData.updateOne(
      { "complaints.complaintId": id },
      {
        $push: { "complaints.$.remarks": nremark },
        "complaints.$.status": status,
      }
    );
    console.log("Saved");
    res.status(200).json({ status: "success" });
  } catch (err) {
    console.log("error");
    res.status(500).json({ status: "internal server error" });
  }
});

router.get("/logout", (req, res) => {
  res.session = null; // Passport.js method to clear the user's session
  return res.redirect("http://localhost:3000/login"); // Redirect the user to the desired logout confirmation page
});

module.exports = router;
