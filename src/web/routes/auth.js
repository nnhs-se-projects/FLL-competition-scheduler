/**
 * FLL Competition Scheduler - Authentication Routes
 *
 * This file handles authentication using Google Sign-In.
 */

// cSpell:ignoreRegExp /[^\s]{40,}/

import express from "express";
const route = express.Router();

// Google OAuth client ID from environment variables
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// Import Google Auth Library
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client();

/**
 * Verify a Google ID token
 * @param {string} token - The ID token to verify
 * @returns {Object} The payload from the token
 */
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
  });
  const payload = ticket.getPayload();
  return payload;
}

route.get("/", (req, res) => {
  res.render("auth", { googleClientId: CLIENT_ID });
});

route.post("/", async (req, res) => {
  const userPayload = await verify(req.body.credential);
  req.session.user = userPayload;
  req.session.email = userPayload.email;
  res.status(201).json({ redirectUrl: "/overview" });
});

route.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

export default route;
