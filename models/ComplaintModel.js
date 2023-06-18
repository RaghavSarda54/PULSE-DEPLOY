const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    formType: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    aadhar: {
      type: String,
      required: true,
    },
    complaint: {
      type: String,
      required: true,
    },
    status:Boolean,
    remarks:[{
      data:String,
      date:Date
    }]
    // latitude: {
    //   type: Number,
    //   // required: true,
    // },
    // longitude: {
    //   type: Number,
    //   // required: true,
    // },
  },
  { timestamps: true } // Add the timestamps option
);

const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;
