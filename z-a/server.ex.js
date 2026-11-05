const express = require("express");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 9999;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(express.json());

// Root endpoint: http://localhost:9999
app.get("/", (req, res) => {
  res.status(200).json({
    message: "API is running at http://localhost:" + PORT,
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
