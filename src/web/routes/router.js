/**
 * FLL Competition Scheduler - Router
 *
 * This file defines all the routes for the web application.
 */

import express from "express";
const route = express.Router();

// Import models and adapters
import Entry from "../models/entry.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { FLLSchedule } = require("../scheduleAdapter.cjs");

// Import static data
const habitsOfMind = require("../models/habitsOfMind.json");

// Import auth router
import authRouter from "./auth.js";

/**
 * Helper function to generate a new schedule
 * @param {Object} options - Configuration options
 * @returns {Object} The generated schedule
 */
function generateNewSchedule(options = {}) {
  const schedule = new FLLSchedule();

  // Set custom parameters if provided
  if (options.numTeams) {
    schedule.setNumTeams(parseInt(options.numTeams));
  }

  if (options.numTables) {
    schedule.setNumTables(parseInt(options.numTables));
  }

  if (options.numJudgingRooms) {
    schedule.setNumJudgingRooms(parseInt(options.numJudgingRooms));
  }

  schedule.populateWithRandomGenes();
  return {
    tableRuns: schedule.buildTableSchedule(),
    judgingSchedule: schedule.buildJudgingSchedule(),
    teamsSchedule: schedule.buildTeamsSchedule(),
  };
}

// Landing page route
route.get("/", (req, res) => {
  if (req.session.email) {
    // Generate schedule if it doesn't exist in session
    if (!req.session.schedule) {
      req.session.schedule = generateNewSchedule();
    }
    res.render("overview", {
      schedule: req.session.schedule,
      path: "/",
    });
  } else {
    res.render("landing");
  }
});

// Overview page route
route.get("/overview", (req, res) => {
  // Generate schedule if it doesn't exist in session
  if (!req.session.schedule) {
    req.session.schedule = generateNewSchedule();
  }
  res.render("overview", {
    schedule: req.session.schedule,
    path: "/overview",
  });
});

// Tables page route
route.get("/tables", (req, res) => {
  // Generate schedule if it doesn't exist in session
  if (!req.session.schedule) {
    req.session.schedule = generateNewSchedule();
  }
  res.render("tables", {
    schedule: req.session.schedule,
    path: "/tables",
  });
});

// Judging page route
route.get("/judging", (req, res) => {
  // Generate schedule if it doesn't exist in session
  if (!req.session.schedule) {
    req.session.schedule = generateNewSchedule();
  }
  res.render("judging", {
    schedule: req.session.schedule,
    path: "/judging",
  });
});

// Teams page route
route.get("/teams", (req, res) => {
  // Generate schedule if it doesn't exist in session
  if (!req.session.schedule) {
    req.session.schedule = generateNewSchedule();
  }
  res.render("teams", {
    schedule: req.session.schedule,
    path: "/teams",
  });
});

// Schedule configuration page route
route.get("/schedule-config", (req, res) => {
  // Generate schedule if it doesn't exist in session
  if (!req.session.schedule) {
    req.session.schedule = generateNewSchedule();
  }
  res.render("schedule-config", {
    schedule: req.session.schedule,
    path: "/schedule-config",
  });
});

// Route to regenerate the schedule
route.get("/regenerate-schedule", (req, res) => {
  const options = {
    numTeams: req.query.numTeams,
    numTables: req.query.numTables,
    numJudgingRooms: req.query.numJudgingRooms,
  };

  req.session.schedule = generateNewSchedule(options);
  res.redirect(req.headers.referer || "/schedule-config");
});

// Example route for API access
route.get("/example", (req, res) => {
  const schedule = new FLLSchedule();
  schedule.populateWithRandomGenes();
  schedule.printSchedule();
  res.send(JSON.stringify(schedule));
});

// Use the auth router for /auth routes
route.use("/auth", authRouter);

export default route;
