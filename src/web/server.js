/**
 * FLL Competition Scheduler - Web Server
 *
 * This file contains the Express server configuration for the FLL Competition Scheduler.
 */

// Import required modules
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import session from "express-session";

// Import database connection
import connectDB from "./connection.js";

// Import routes
import router from "./routes/router.js";
import authRoutes from "./routes/auth.js";

// Import admin user check
import { isAdmin } from "./models/adminUsers.js";

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

// Create Express application
const app = express();
//finished aut
// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Set up view engine
app.set("view engine", "ejs");

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set views directory
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/js", express.static(path.join(__dirname, "public/js")));
app.use("/img", express.static(path.join(__dirname, "public/img")));

// Authentication middleware
app.use((req, res, next) => {
  // Allow access to landing page and auth routes without login
  if (req.path === "/" || req.path.startsWith("/auth")) {
    next();
    return;
  }

  // Redirect to auth for all other routes if not logged in
  if (req.session.email === undefined) {
    res.redirect("/auth/");
    return;
  }

  // Store user's admin status in locals for views
  res.locals.isAdmin = isAdmin(req.session.user);
  res.locals.userEmail = req.session.email;

  next();
});

// Authorization middleware for configuration routes
app.use((req, res, next) => {
  // Check if the route is a configuration route
  const configRoutes = [
    "/schedule-config",
    "/regenerate-schedule",
    "/save-config",
    "/api/save-schedule",
    "/api/save-ai-config",
    "/admin",
  ];

  const isConfigRoute = configRoutes.some((route) =>
    req.path.startsWith(route)
  );

  // If it's a configuration route, check if user is an admin
  if (isConfigRoute) {
    if (isAdmin(req.session.user)) {
      next();
    } else {
      // Non-admin users are redirected to the overview page
      res.redirect("/overview?error=unauthorized");
    }
  } else {
    // Non-configuration routes don't need authorization
    next();
  }
});

// Set up routes
app.use("/auth", authRoutes);
app.use("/", router);

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
