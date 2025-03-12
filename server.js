/**
 * main Javascript file for the application
 *  this file is executed by the Node server
 */

// import the http module, which provides an HTTP server
import http from "http";

// import the express module, which exports the express function
import express from "express";

// invoke the express function to create an Express application
const app = express();

// add middleware to handle JSON in HTTP request bodies (used with
//  POST commands)
app.use(express.json());

// load environment variables from the .env file into process.env
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

// connect to the database
import connectDB from "./server/database/connection.js";
connectDB();

// import the express-session module, which is used to manage sessions
import session from "express-session";
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// set the template engine to EJS, which generates HTML with embedded
//  JavaScript
app.set("view engine", "ejs");

// load assets
app.use("/css", express.static("assets/css"));
app.use("/img", express.static("assets/img"));
app.use("/js", express.static("assets/js"));

// app.use takes a function that is added to the chain of a request.
//  When we call next(), it goes to the next function in the chain.
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

  next();
});

// load routers
import router from "./server/routes/router.js";

// create the HTTP server
const server = http.createServer(app);

// load router
app.use("/", router);

// start the server on port 8080
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
