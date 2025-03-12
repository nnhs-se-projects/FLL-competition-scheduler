/**
 * FLL Competition Scheduler - Web Server
 *
 * This is the main entry point for the web application.
 */

// Import required modules
import http from "http";
import express from "express";
import dotenv from "dotenv";
import session from "express-session";

// Load environment variables
dotenv.config();

// Create Express application
const app = express();

// Configure middleware
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fll-competition-scheduler-secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Set view engine
app.set("view engine", "ejs");
app.set("views", "./src/web/views");

// Serve static files
app.use("/css", express.static("./src/web/public/css"));
app.use("/js", express.static("./src/web/public/js"));
app.use("/img", express.static("./src/web/public/img"));

// Connect to database
import connectDB from "./connection.js";
connectDB();

// Authentication middleware
app.use((req, res, next) => {
  // Allow access to landing page, auth routes, and example endpoint without login
  if (
    req.path === "/" ||
    req.path.startsWith("/auth") ||
    req.path === "/example"
  ) {
    next();
    return;
  }

  // Redirect to auth for all other routes if not logged in
  if (req.session.email === undefined) {
    res.redirect("/auth/");
    return;
  }

  next();
});

// Import and use routes
import router from "./routes/router.js";
app.use("/", router);

// Start server
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
