const express = require("express");
const FormUser= require("../models/FormUserSchema");
const router = express.Router();
const bcrypt = require('bcrypt');
const User= require("../models/UserModel")
var cookieSession = require('cookie-session');

router.post("/",async (req,res)=>{
    try{
        console.log(req.body);
        const {email, password } = req.body;

        const existinguser= await FormUser.findOne({email:email});
        const existingoauthuser= await User.findOne({email:email});
        if(existingoauthuser){
            req.session.user= existingoauthuser;
            return res.status(200).json({ message: 'Authentication successful' });
        }
        if(!existinguser){
             return res.status(401).json({ message: 'User Does Not Exist. Please Register' });
        }
        const hashedPassword = existinguser.password;

        // Compare the entered password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, hashedPassword);
    
        if (passwordMatch) {
          // Passwords match, authentication successful
          req.session.user= existinguser;
          console.log(req.session);
          return res.status(200).json({ message: 'Authentication successful' });
        } else {
          // Passwords do not match, authentication failed
          return res.status(401).json({ message: 'Password Does Not Match' });
        }
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
});


module.exports = router;