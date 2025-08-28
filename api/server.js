const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const http = require("http");

dotenv.config({ path: "config.env" });
const ApiError = require("./utils/apiError");

const globalError = require("./middlewares/errorMiddleware");
const dbConnection = require("./config/database");
const mountRoutes = require("./routes");
// Connect with db
dbConnection();

// Express app
const app = express();

// Middlewares
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Cors
app.use(cors());
app.use(
  cors({
    origin: [
      "*",
      "https://learn-gauge.vercel.app/login",
      "https://learn-gauge.vercel.app",
    ], // Replace with your frontend URL
    credentials: true, // Allow sending cookies with the request
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
} else {
  app.use(morgan("combined"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Mount Routes
mountRoutes(app);

// Catch-all route for undefined routes
app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware for express
app.use(globalError);

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
