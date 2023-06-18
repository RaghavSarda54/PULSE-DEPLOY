const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  formType: {
    type: String,
    required: true,
  },
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Complaint",
    required: true,
  },
  ratings: {
    type: [Number],
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
  averageRating: {
    type: Number,
    required: true,
  },
  // latitude: {
  //   type: Number,
  //   // required: true,
  // },
  // longitude: {
  //   type: Number,
  //   // required: true,
  // },
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
