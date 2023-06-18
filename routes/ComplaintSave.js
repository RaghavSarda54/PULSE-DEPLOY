const express = require("express");
const Complaint = require("../models/ComplaintModel");
const Review = require("../models/ReviewModel");
const router = express.Router();
const Coordinate= require("../models/CoordinatesModel");
router.post("/complaint/:latitude/:longitude", async (req, res) => {
  try {
    const latitude = parseFloat(req.params.latitude);
    const longitude = parseFloat(req.params.longitude);
    const { formType, name, age, phone, aadhar, complaint } = req.body;
    const complaintData = new Complaint({
      formType,
      name,
      age,
      phone,
      aadhar,
      complaint,
      latitude,
      longitude,
    });
    complaintData.save().then((savedComplaint) => {
      console.log("Complaint Data Saved");
      res.status(200).json({
        message: "Complaint Data Saved Successfully!",
        complaintId: savedComplaint._id,
      });
    });
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
    const existingComplaint = await Complaint.findById(complaintId);
    if (!existingComplaint) {
      // throw new Error("Invalid Complaint Id");
      res.status(400).json({ error: "Invalid Complaint Id" });
    }
    const admin= await Coordinate.findOne({latitude:latitude,longitude:longitude});
    const orating= admin.reviews.length*admin.rating;
    const nrating= (orating+averageRating)/(admin.reviews.length +1);
    await Coordinate.updateOne({latitude:latitude,longitude:longitude},{rating:nrating});
    const reviewData = new Review({
      formType,
      complaintId,
      ratings,
      review,
      averageRating,
      latitude,
      longitude,
    });
    await reviewData.save().then(() => {
      console.log("Review Data Saved");
      res.status(200).json({ message: "Review Data Saved Successfully!" });
    });
  } catch (error) {
    console.error("Error saving review data:", error);
    res.status(500).json({ error: "Error saving review data" });
  }
});
module.exports = router;
