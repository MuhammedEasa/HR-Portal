const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { default: axios } = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", Credential: true }));

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

// database connection

mongoose
  .connect(process.env.MONGO_STR)
  .then(() => {
    console.log("Mongodb connected");
  })
  .catch(() => {
    console.log("connection failed");
  });

// const session = require("express-session");
const cookieParser = require("cookie-parser");
const authRoutes = require("../MVC/router/authRoutes");

app.post("/authenticate", async (req, res) => {
  const { username } = req.body;
  console.log( "session",req.session.user);
  console.log("userName is", req.body);
  
  try {
    // res.status(200).json({username})
    const r = await axios.put(
      "https://api.chatengine.io/users/",
      { username: username, secret: username, first_name: username },
      { headers: { "private-key": "be4cc75a-fd80-4232-a87e-e103105d972b" } }
    );
    // console.log("ssss",r);
    return res.status(r.status).json(r.data);
  } catch (e) {
    return res.status(e.response.status).json(e.response.data);
  }
});


// app.get("/chat-data", async (req, res) => {
//   const { chatId } = req.query; // Assume chatId is passed as a query parameter
//   console.log("chatId",chatId);
//   if (!chatId) {
//     return res.status(400).json({ error: "Chat ID is required" });
//   }

//   try {
//     const response = await axios.get(`https://api.chatengine.io/chats/${chatId}/`, {
//       headers: {
//         "Project-ID": "your_project_id",
//         "User-Name": "user_name",
//         "User-Secret": "user_secret"
//       }
//     });

//     console.log("Chat Data:", response.data);
//     return res.status(200).json(response.data);
//   } catch (error) {
//     console.error('Error fetching chat data:', error);
//     return res.status(error.response ? error.response.status : 500).json({ error: "Failed to fetch chat data" });
//   }
// });


app.use(express.static("public/uploads"));
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
// app.set("views", "./views/user");
app.set("views", "../MVC/views/user");

// Routes
app.use("/", authRoutes);

app.listen(3001);
