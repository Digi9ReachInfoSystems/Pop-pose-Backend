const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/mongoConfig");

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
connectDB();
app.use(cors());
app.use(express.json());
app.use("/api/copies", require("./routes/copyRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/frame", require("./routes/frameRoute"));
app.use("/api/time", require("./routes/timeRoutes"));
app.use("/api/background", require("./routes/backgroundRoutes"));
app.use("/api/consent", require("./routes/consentRoutes"))
app.use("/api/backdrop", require("./routes/backdropRoutes"))
app.use("/api/admin", require("./routes/adminRoutes"))
// app.use("/api/payment", require("./routes/paymentRoutes"))
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//orientation as well needs to be updated in frame model************

///for each copy it is 50 rupees  

//by default it is 2 copy
//timer access  controll
// the no of photos should be double the no of frames selected
//camera timer should be dynamic
// both the timers should be controlled by admin panel

//2by6 4by6

///background has to be based on orientation
//consent things has to been implemented for social media sharing.
//login for settings page as well . general id for all
//admin can change the id password .


//location for one particualr booth .


//location permission for given ....

//main background of the applicationm should bve dynamic 

//zoom in and zoom out 
//tilt with frame of image 
//settings also needs rotation

