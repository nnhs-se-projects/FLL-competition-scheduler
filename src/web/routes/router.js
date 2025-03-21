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
  const scheduleData = {
    tableRuns: schedule.buildTableSchedule(),
    judgingSchedule: schedule.buildJudgingSchedule(),
    teamsSchedule: schedule.buildTeamsSchedule(),
  };

  // Apply custom team names if provided
  if (options.teamNames && options.teamNames.length > 0) {
    [
      scheduleData.tableRuns,
      scheduleData.judgingSchedule,
      scheduleData.teamsSchedule,
    ].forEach((scheduleType) => {
      if (Array.isArray(scheduleType)) {
        scheduleType.forEach((item) => {
          if (Array.isArray(item)) {
            item.forEach((event) => {
              if (event.teamID && options.teamNames[event.teamID - 1]) {
                event.teamName = options.teamNames[event.teamID - 1];
              }
            });
          }
        });
      }
    });
  }

  return scheduleData;
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
  // Initialize config if it doesn't exist
  if (!req.session.config) {
    req.session.config = {
      numTeams: 32,
      numTables: 4,
      numJudgingRooms: 8,
      teamNames: [],
    };
  }

  // Generate schedule if it doesn't exist in session
  if (!req.session.schedule) {
    req.session.schedule = generateNewSchedule(req.session.config);
  }

  res.render("schedule-config", {
    schedule: req.session.schedule,
    config: req.session.config,
    path: "/schedule-config",
  });
});

// Route to regenerate the schedule
route.get("/regenerate-schedule", (req, res) => {
  const config = {
    numTeams:
      parseInt(req.query.numTeams) || req.session.config?.numTeams || 32,
    numTables:
      parseInt(req.query.numTables) || req.session.config?.numTables || 4,
    numJudgingRooms:
      parseInt(req.query.numJudgingRooms) ||
      req.session.config?.numJudgingRooms ||
      8,
    teamNames: req.session.config?.teamNames || [],
  };

  // Update session config
  req.session.config = config;

  // Generate new schedule with config
  req.session.schedule = generateNewSchedule(config);

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

// Add this route to handle saving configuration
route.post("/save-config", (req, res) => {
  // Save configuration to session
  req.session.config = {
    numTeams: parseInt(req.body.numTeams) || 32,
    numTables: parseInt(req.body.numTables) || 4,
    numJudgingRooms: parseInt(req.body.numJudgingRooms) || 8,
    teamNames: req.body.teamNames || [],
  };

  // Clear existing schedule when config changes
  req.session.schedule = null;

  // Generate new schedule with updated config
  req.session.schedule = generateNewSchedule(req.session.config);

  res.redirect("/schedule-config");
});

export default route;
