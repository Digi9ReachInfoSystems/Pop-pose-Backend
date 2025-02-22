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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
