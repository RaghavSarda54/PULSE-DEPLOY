const express = require("express");
const nodemailer = require("nodemailer");
const Coordinate = require("../models/CoordinatesModel");
const Complaint = require("../models/ComplaintModel");
const Review = require("../models/ReviewModel");
const UserData = require("../models/UserDataModel");

const router = express.Router();
var date = new Date();
// const formattedDate = date.toLocaleDateString('en-US', {
//   day: '2-digit',
//   month: '2-digit',
//   year: '2-digit'
// });
// console.log(formattedDate);
router.post("/complaint/:latitude/:longitude", async (req, res) => {
  try {
    const latitude = parseFloat(req.params.latitude);
    const longitude = parseFloat(req.params.longitude);
    const { formType, title, name, age, phone, aadhar, complaint } = req.body;
    const email = req.body.email;
    var coordinate = await Coordinate.findOne({ latitude, longitude });
    if (!coordinate) {
      coordinate = await Coordinate.findOneAndUpdate(
        { latitude, longitude },
        {
          ratinggraph: { data: [0, 0, 0, 0, 0, 0], LastUpdatedAt: date },
          rating: 0,
        },
        { upsert: true, new: true }
      );
    }
    const status = false;
    const savedComplaint = await Complaint.create({
      formType,
      title,
      name,
      age,
      phone,
      aadhar,
      complaint,
      status,
    });

    coordinate.complaints.push({
      complaintId: savedComplaint._id,
      ...req.body,
      status: status,
    });

    await coordinate.save();

    const userData = await UserData.findOne({ email: email });

    if (userData) {
      console.log("Found existing user:");
      console.log(email);
      userData.complaints.push({
        complaintId: savedComplaint._id,
        ...req.body,
        status: status,
      });
      await userData.save();
    } else {
      console.log(email);
      const newUserData = new UserData({
        email: email,
        complaints: [
          { complaintId: savedComplaint._id, ...req.body, status: status },
        ],
        reviews: [],
      });
      await newUserData.save();
    }
    let mailTransporter = await nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "pulse7561@gmail.com",
        pass: "fkfzrtomrjweslkd",
      },
    });

    let details = {
      from: "sardaraghav54@gmail.com",
      to: email,
      subject: `${savedComplaint.title} Complaint Confirmation`,
      text: `Your complaint with ID ${savedComplaint._id} has been saved successfully.`,
    };

    // mailTransporter.sendMail(details, (error, info) => {
    //   if (error) {
    //     console.error("Error sending email:", error);
    //   } else {
    //     console.log("Email sent:", info.response);
    //   }
    // });
    mailTransporter
      .sendMail(details)
      .then(() => {
        console.log("You should get the email");
        return res.status(201).json({ msg: "You should get the email" });
      })
      .catch((error) => {
        return res.status(500).json({ error });
      });
    // console.log("Complaint Data Saved");
    // res.status(200).json({
    //   message: "Complaint Data Saved Successfully!",
    //   complaintId: savedComplaint._id,
    // });
  } catch (error) {
    console.error("Error saving complaint data:", error);
    res.status(500).json({ error: "Error saving complaint data" });
  }
});

router.post("/review/:latitude/:longitude", async (req, res) => {
  try {
    const latitude = parseFloat(req.params.latitude);
    const longitude = parseFloat(req.params.longitude);
    const { formType, complaintId, ratings, review, averageRating } = req.body;
    const email = req.body.email;
    const existingComplaint = await Coordinate.findOne({
      latitude: latitude,
      longitude: longitude,
      "complaints.complaintId": complaintId,
    });
    console.log(req.body);
    if (!existingComplaint) {
      res.status(400).json({ error: "Invalid Complaint Id" });
      return;
    }

    const coordinate = await Coordinate.findOneAndUpdate(
      { latitude, longitude },
      {},
      { upsert: true, new: true }
    );

    const existingReview = await Review.findOne({ complaintId });
    if (existingReview) {
      return res
        .status(400)
        .json({ error: "Review Already Exists for this Complaint Id!" });
    }
    const admin = await Coordinate.findOne({
      latitude: latitude,
      longitude: longitude,
    });
    const orating = admin.reviews.length * admin.rating;
    const nrating = (orating + averageRating) / (admin.reviews.length + 1);
    const gratings = admin.ratinggraph.data;
    const last = admin.ratinggraph.LastUpdatedAt;
    const dbdate = new Date(last).getMonth();
    if (dbdate == date.getMonth()) {
      gratings[gratings.length - 1] = nrating;
    } else {
      for (let index = 0; index < gratings.length - 1; index++) {
        gratings[index] = gratings[index + 1];
      }
      gratings[gratings.length - 1] = nrating;
    }
    await Coordinate.updateOne(
      { latitude: latitude, longitude: longitude },
      { rating: nrating, ratinggraph: { data: gratings, LastUpdatedAt: date } }
    );

    const savedReview = await Review.create({
      formType,
      complaintId,
      ratings,
      review,
      averageRating,
    });

    coordinate.reviews.push({
      reviewId: savedReview._id,
      ...req.body,
    });

    await coordinate.save();

    const userData = await UserData.findOne({ email: email });

    if (userData) {
      userData.reviews.push({
        reviewId: savedReview._id,
        ...req.body,
      });
      await userData.save();
    } else {
      const newUserData = new UserData({
        email: email,
        complaints: [],
        reviews: [{ reviewId: savedReview._id, ...req.body }],
      });
      await newUserData.save();
    }

    console.log("Review Data Saved");
    res.status(200).json({ message: "Review Data Saved Successfully!" });
  } catch (error) {
    console.error("Error saving review data:", error);
    res.status(500).json({ error: "Error saving review data" });
  }
});

// GET complaints for a specific user
router.get("/user/:email/complaint", async (req, res) => {
  try {
    const email = req.params.email;
    const userData = await UserData.findOne({ email: email });

    if (!userData) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const complaints = userData.complaints;
    console.log("Complaints data:", complaints);
    res.json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ error: "Error fetching complaints" });
  }
});

// GET reviews for a specific user
router.get("/user/:email/review", async (req, res) => {
  try {
    const email = req.params.email;
    const userData = await UserData.findOne({ email: email });

    if (!userData) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const reviews = userData.reviews;
    console.log("Reviews data:", reviews);
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Error fetching reviews" });
  }
});

module.exports = router;
