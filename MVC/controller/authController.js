const express = require("express");
const app = express();
const userCollection = require("../model/user");
const speakeasy = require("speakeasy");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

// let otpmail;

// // Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "akbarhaleel508@gmail.com",
    pass: "gwvm bfrb rmou tcda",
  },
});

// Generate a new secret for TOTP
const secret = speakeasy.generateSecret({ length: 10, name: "MyApp" });

//   // Function to generate an OTP token
const generateOTPToken = () => {
  return speakeasy.totp({
    secret: secret.base32,
    encoding: "base32",
  });
};

//   // Function to send OTP via email
const sendOTPEmail = (email, otp) => {
  const mailOptions = {
    from: "akbarhaleel508@gmail.com",
    to: email,
    subject: "One-Time Password (OTP)",
    text: `Your OTP for MyApp: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

//OTP get Router
// exports.getOtp = (req, res) => {
//     res.render("otp")
//   }

// // resend otp get
// exports.resendotp = (req, res) => {
//     try {
//       console.log("RESEND  OTP GET");
//       let userEmailAddress = otpmail;
//       console.log("mail is", userEmailAddress);
//       console.log(req.session.otpToken);
//       req.session.otpToken = generateOTPToken();
//       console.log(req.session.otpToken);

//       // Send OTP via email
//       sendOTPEmail(userEmailAddress, req.session.otpToken);
//       res.redirect("/otp");
//     } catch (error) {
//       console.log(error);
//     }
//   }

//   // OTP post Router
// exports.postOtp = async (req, res) => {
//     try {
//       console.log(req.session.userdetails);

//       const enteredotp = req.body.digits;

//       console.log("User entered OTP:", enteredotp);

//       if (enteredotp === req.session.otpToken) {
//         // Validate user input
//         // if (!req.session.userdetails.username || !req.session.userdetails.email || !req.session.userdetails.password) {
//         //   return res.status(400).send("Invalid input. Please provide all required fields.");
//         // }

//         // Hash and salt the password
//         const saltRounds = 10;
//         const hashedPassword = await bcrypt.hash(req.session.userdetails.password, saltRounds);

//         // Replace plain password with hashed password
//         req.session.userdetails.password = hashedPassword;

//         // Create a user in the database
//         await userCollection.create(req.session.userdetails);

//         // Redirect to login page upon successful registration
//         res.redirect('/login');
//         console.log("OTP verified successfully!");
//       } else {
//         // Render an error message if OTP is invalid
//         res.render("otp", { message: "Invalid OTP. Please try again." });
//         console.log("Invalid OTP. Please try again.");
//       }
//     } catch (error) {
//       // Log and handle errors appropriately
//       console.error("Error:", error);
//       res.status(500).send("Internal Server Error");
//     }
//   };

// signup get

exports.getSignup = (req, res) => {
  try {
    res.render("signup");
  } catch (error) {
    console.log("error in signup get", error);
  }
};
exports.getLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.error("Error in getlogin route:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.postSignup = async (req, res) => {
  try {
    console.log("signup Post is working");
    console.log("value is :", req.body);
    const data = {
      username: req.body.name,
      email: req.body.email,
      password: req.body.password,
    };
    req.session.userdetails = data;

    const userExist = await userCollection.findOne({ email: data.email });
    if (!userExist) {
      // Example usage
      const userEmailAddress = data.email;
      req.session.otpToken = generateOTPToken();
      console.log(req.session.otpToken);
      otpmail = userEmailAddress;
      // Send OTP via email
      sendOTPEmail(userEmailAddress, req.session.otpToken);
      console.log("success");
      res.redirect("/otp");
    } else {
      res.render("signup", { message: "User is already Exisis" });
    }
  } catch (error) {
    console.error("Error in getlogin route:", error);
    res.status(500).send("Internal Server Error");
  }
};

// otp get
exports.getOtp = (req, res) => {
  try {
    res.render("otp");
  } catch (error) {
    console.log("otp get error ", error);
  }
};

// OTP post Router
exports.postOtp = async (req, res) => {
  try {
    console.log(req.session.userdetails);

    const enteredotp = req.body.digits;
    console.log("User entered OTP:", enteredotp);

    if (enteredotp === req.session.otpToken) {
      // Hash and salt the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(
        req.session.userdetails.password,
        saltRounds
      );

      // Replace plain password with hashed password
      req.session.userdetails.password = hashedPassword;

      // Create a user in the database
      await userCollection.create(req.session.userdetails);

      // Redirect to login page upon successful registration
      res.redirect("/login");
      console.log("OTP verified successfully!");
    } else {
      // Render an error message if OTP is invalid
      res.render("otp", { message: "Invalid OTP. Please try again." });
      console.log("Invalid OTP. Please try again.");
    }
  } catch (error) {
    // Log and handle errors appropriately
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

// post login
exports.postLogin = async (req, res) => {
  try {
    const data = {
      email: req.body.email,
      password: req.body.password,
    };

    if (!data.email || !data.password) {
      res.render("login", { message: "Username and password are required." });
      return;
    } else {
      const user = await userCollection.findOne({ email: data.email });

      if (!user) {
        console.log("Account doesn't exist");
        res.render("login", {
          message: "Account doesn't exist. Use different credentials.",
        });
      } else {
        if (user.role === "admin") {
          res.redirect("/home");
        } else {
          // Use bcrypt.compare correctly as it returns a promise
          const passwordMatch = await bcrypt.compare(
            data.password,
            user.password
          );

          if (!passwordMatch) {
            console.log("Incorrect password");
            res.render("login", {
              message: "Incorrect password. Use different credentials.",
            });
          } else {
            // Assuming you want to store the username in the session
            req.session.user = {
              userId: user._id,
              username: user.username,
            };

            //   const userData = await userCollection.findOne({ username: user.username });

            //   const userdata = {
            //     userId: req.session.user.userId,
            //     username: userData.username,
            //     email: userData.email
            //   }
            //   const check = await profileSchema.findOne(userdata)
            //   if (!check) {
            //     await profileSchema.create(userdata);
            //   } else {
            //     await profileSchema.updateOne(userdata);

            //   }

            console.log("Session in login post", req.session.user);
            res.redirect("/userhome");
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in profile route:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.getHome = async (req, res) => {
  try {
    res.render("home");
  } catch (error) {
    console.error("Error in getlogin route:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.HRMangement = async (req, res) => {
  try {
    res.render("HrMangement");
  } catch (error) {
    console.error("Error in getlogin route:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.admin = (req, res) => {
  try {
    res.render("admin");
  } catch (error) {
    console.log("error in adminlogin", error);
  }
};

exports.postAdmin = (req, res) => {
  try {
    const { adminName, adminEmail, adminPassword } = req.body;
    req.session.adminPassword = adminPassword;
    const newUser = new userCollection({
      username: adminName,
      role: "admin",
      email: adminEmail,
      password: adminPassword,
    });

    // Saving the new document to the database
    newUser.save().then((savedUser) => {
      // Handle success
      console.log("New user created:", savedUser);
    });
    console.log("admin session is", req.session.adminPassword);
    res.redirect("/login");
  } catch (error) {
    console.log("error in adminlogin post", error);
  }
};


// User Home
exports.userhome =async (req,res)=>{
  try {
console.log();
const userId = req.session.user.userId;
const user = await userCollection.findOne({_id:userId})
console.log(user);
    res.render("userhome", {user})
  } catch (error) {
    console.log("error in userhome get", error);
  }
}
exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect("/login");
};
