// const mongoose = require("mongoose");
// const { Schema } = mongoose;
// const UserDataSchema = new Schema({
//   userId: {
//     type: String,
//     // required: true,
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

// const UserData = mongoose.model("UsersData", UserDataSchema);
// module.exports = UserData;

const mongoose = require("mongoose");
const { Schema } = mongoose;

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
});

const UserDataSchema = new Schema({
  email: {
    type: String,
    // required: true,
  },
  complaints: [ComplaintSchema],
  reviews: [ReviewSchema],
});

UserDataSchema.set("timestamps", true);

const UserData = mongoose.model("UsersData", UserDataSchema);
module.exports = UserData;
