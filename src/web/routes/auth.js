/**
 * FLL Competition Scheduler - Authentication Routes
 *
 * This file handles authentication using Google Sign-In.
 */

// cSpell:ignoreRegExp /[^\s]{40,}/

import express from "express";
const route = express.Router();

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
    audience: process.env.GOOGLE_CLIENT_ID, // Access environment variable directly
  });
  const payload = ticket.getPayload();
  return payload;
}

route.get("/", (req, res) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  res.render("auth", { googleClientId });
});

route.post("/", async (req, res) => {
  req.session.email = await verify(req.body.credential);
  res.status(201).json({ redirectUrl: "/overview" });
});

route.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

export default route;
