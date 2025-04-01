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
app.use("/api/payment", require("./routes/paymentRoutes"))
app.use("/api/coupon", require("./routes/couponRoutes"))
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
