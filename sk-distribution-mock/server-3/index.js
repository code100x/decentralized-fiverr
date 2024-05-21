const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const app = express();

app.use(express.json());

// Vernalibity: Only allow request from our main backend
app.use(cors());

app.get("/share", (req, res) => {
  console.log(req.headers);
  const share = process.env.SHARE;
  if (!share) {
    return res.status(404).json({ message: "Share not found." });
  }
  res.status(200).json({ share });
});

app.listen(6060);
