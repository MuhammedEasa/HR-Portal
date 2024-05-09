const express = require("express");
const router = express.Router();
const session = require("express-session");
require('dotenv').config();

const{getHome,HRMangement,getLogin,getOtp,postOtp,userhome} = require('../controller/authController');
const{postSignup,postLogin,logout,admin,postAdmin} = require('../controller/authController');
// const{home} = require('../controller/userController');


router.get("/home", getHome);
router.get("/HrMangement", HRMangement);
router.get("/login", getLogin);
router.post("/login", postLogin);
router.post("/signup", postSignup); 
//OTP get router
router.get("/otp", getOtp)
router.post("/otp", postOtp)
router.get('/logout',logout)
//role based authenctication
router.get('/admin',admin)
router.post('/admin', postAdmin)
// userhome
router.get('/userhome',userhome)

module.exports = router;