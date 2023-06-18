const express = require("express");
const FormUser= require("../models/FormUserSchema");
const router = express.Router();
const bcrypt = require('bcrypt');
const User= require("../models/UserModel");

router.post("/",async (req,res)=>{
    try{
        // const {email, password } = req.body;

        const existinguser= await FormUser.findOne({email:req.body.email});
        const existingoauthuser= await User.findOne({email:req.body.email});
        
        if(existinguser||existingoauthuser){
            return res.status(401).json({ message: 'User Already Exists' });
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newuser= new FormUser({
            email:req.body.email,
            password:hashedPassword,
        })
        
        newuser.save().then((saveduser)=>{
            return res.status(200).json({ message: 'Authentication successful' });
        });
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
});


module.exports = router;