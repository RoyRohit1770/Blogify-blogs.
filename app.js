// Add a unique debugging statement
console.log("Running app.js from blogify (1)");

// Load environment variables (optional if not using for MongoDB URI)
require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser"); // Fixed typo

const Blog = require("./models/blog");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog"); // Fixed require statement

const { checkForAuthenticationCookie } = require("./middlewares/authentication");

const app = express();
const PORT = process.env.PORT || 8000;

// Handle Deprecation Warning
mongoose.set('strictQuery', false); // or true based on your needs

// Connect to MongoDB with hardcoded URI
mongoose
  .connect("mongodb://127.0.0.1:27017/blogify", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Set up view engine and views directory
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // Fixed typo
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

// Routes
app.get("/", async (req, res) => {
  try {
    const allBlogs = await Blog.find({});
    res.render("home", {
      user: req.user,
      blogs: allBlogs,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

// Start the server
app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
