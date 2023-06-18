// const mongoose = require("mongoose");
// const { Schema } = mongoose;
// const CoordinateSchema = new Schema({
//   latitude: {
//     type: Number,
//     required: true,
//   },
//   longitude: {
//     type: Number,
//     required: true,
//   },
//   complaints: [
//     {
//       complaintId: {
//         type: Schema.Types.ObjectId,
//         ref: "Complaint",
//       },
//       formType: String,
//       title: String,
//       name: String,
//       age: Number,
//       phone: String,
//       aadhar: String,
//       complaint: String,
//     },
//     { timestamps: true },
//   ],
//   reviews: [
//     {
//       reviewId: {
//         type: Schema.Types.ObjectId,
//         ref: "Review",
//       },
//       formType: String,
//       complaintId: {
//         type: Schema.Types.ObjectId,
//         ref: "Complaint",
//       },
//       ratings: [Number],
//       review: String,
//       averageRating: Number,
//     },
//   ],
// });

// const Coordinate = mongoose.model("Coordinate", CoordinateSchema);
// module.exports = Coordinate;

const mongoose = require("mongoose");
const { Schema } = mongoose;
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;
const ComplaintSchema = new Schema(
  {
    complaintId: {
      type: Schema.Types.ObjectId,
      ref: "Complaint",
    },
    formType: String,
    title: String,
    name: String,
    age: Number,
    phone: String,
    aadhar: String,
    complaint: String,
    status:Boolean,
    remarks:[{
      data:String,
      date:Date
    }]
  },
  { timestamps: true } // Apply timestamps to the embedded schema
);

const ReviewSchema = new Schema({
  reviewId: {
    type: Schema.Types.ObjectId,
    ref: "Review",
  },
  formType: String,
  complaintId: {
    type: Schema.Types.ObjectId,
    ref: "Complaint",
  },
  ratings: [Number],
  review: String,
  averageRating: Number,
},{ timestamps: true } );

const CoordinateSchema = new Schema({
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  rating:{
    type:Number,
  },
  ratinggraph:{
    data:[Number],
    LastUpdatedAt:Date,
  },
  complaints: [ComplaintSchema],
  reviews: [ReviewSchema],
});

CoordinateSchema.set("timestamps", true);

const Coordinate = mongoose.model("Coordinate", CoordinateSchema);
module.exports = Coordinate;
