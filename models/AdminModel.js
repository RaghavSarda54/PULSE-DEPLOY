const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  email:{
    type:String,
    required:true,
  },
  password:{
    type:String,
    required:true,
  },
  adminId:{
    type:String,
    required:true,
  },
  latitude:{
    type:String,
    required:true,
  },
  longitude:{
    type:String,
    required:true,
  }
});

const Admin = mongoose.model("Admin", AdminSchema);

module.exports = Admin;
