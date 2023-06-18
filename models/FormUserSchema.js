const mongoose = require("mongoose");

const FormUserSchema = new mongoose.Schema({
  email:{
    type:String,
    required:true,
  },
  password:{
    type:String,
    required:true,
  }
});

const FormUser = mongoose.model("FormUser", FormUserSchema);

module.exports = FormUser;
