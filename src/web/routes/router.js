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
import axios from "axios";

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

  // Set configuration parameters
  if (options.numTeams) schedule.setNumTeams(parseInt(options.numTeams));
  if (options.numTables) schedule.setNumTables(parseInt(options.numTables));
  if (options.numJudgingRooms)
    schedule.setNumJudgingRooms(parseInt(options.numJudgingRooms));

  // Set day bounds if provided
  if (options.dayStart && options.dayEnd) {
    schedule.setDayBounds(
      parseFloat(options.dayStart),
      parseFloat(options.dayEnd)
    );
  }

  // Set lunch time if provided
  if (options.lunchTime && options.lunchDuration) {
    schedule.setLunchTime(
      parseFloat(options.lunchTime),
      parseInt(options.lunchDuration)
    );
  }

  schedule.populateWithRandomGenes();
  const scheduleData = {
    tableRuns: schedule.buildTableSchedule(),
    judgingSchedule: schedule.buildJudgingSchedule(),
    teamsSchedule: schedule.buildTeamsSchedule(),
    score: schedule.score,
  };

  // Apply custom team names and numbers if provided
  if (options.teamInfo && options.teamInfo.length > 0) {
    [
      scheduleData.tableRuns,
      scheduleData.judgingSchedule,
      scheduleData.teamsSchedule,
    ].forEach((scheduleType) => {
      if (Array.isArray(scheduleType)) {
        scheduleType.forEach((items) => {
          if (Array.isArray(items)) {
            items.forEach((event) => {
              if (event.teamID && options.teamInfo[event.teamID - 1]) {
                const teamInfo = options.teamInfo[event.teamID - 1];
                event.teamName = teamInfo.name;
                event.teamNumber = teamInfo.number;
              }
            });
          } else if (items.teamID && options.teamInfo[items.teamID - 1]) {
            // Handle direct event objects
            const teamInfo = options.teamInfo[items.teamID - 1];
            items.teamName = teamInfo.name;
            items.teamNumber = teamInfo.number;
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
      dayStart: 8,
      dayEnd: 17,
      lunchTime: 11.5,
      lunchDuration: 45,
      teamInfo: [],
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
    dayStart:
      parseFloat(req.query.dayStart) || req.session.config?.dayStart || 8,
    dayEnd: parseFloat(req.query.dayEnd) || req.session.config?.dayEnd || 17,
    lunchTime:
      parseFloat(req.query.lunchTime) || req.session.config?.lunchTime || 11.5,
    lunchDuration:
      parseInt(req.query.lunchDuration) ||
      req.session.config?.lunchDuration ||
      45,
    teamInfo: req.session.config?.teamInfo || [],
  };

  // Update session config
  req.session.config = config;

  // Generate new schedule with config
  req.session.schedule = generateNewSchedule(config);

  res.redirect(req.headers.referer || "/schedule-config");
});

// Export schedule to JSON
route.get("/export-schedule", (req, res) => {
  if (!req.session.schedule) {
    req.session.schedule = generateNewSchedule();
  }

  res.setHeader("Content-Type", "application/json");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=fll-schedule.json"
  );
  res.send(JSON.stringify(req.session.schedule, null, 2));
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
    dayStart: parseFloat(req.body.dayStart) || 8,
    dayEnd: parseFloat(req.body.dayEnd) || 17,
    lunchTime: parseFloat(req.body.lunchTime) || 11.5,
    lunchDuration: parseInt(req.body.lunchDuration) || 45,
    teamInfo: req.body.teamNames
      ? req.body.teamNames.map((name, index) => ({
          name: name,
          number: parseInt(req.body.teamNumbers[index]) || index + 1,
        }))
      : [],
  };

  // Clear existing schedule when config changes
  req.session.schedule = null;

  // Generate new schedule with updated config
  req.session.schedule = generateNewSchedule(req.session.config);

  res.redirect("/schedule-config");
});

// AI Schedule Optimizer API
route.post("/api/gemini-optimize", async (req, res) => {
  try {
    const GEMINI_API_KEY =
      process.env.GEMINI_API_KEY || "AIzaSyCuGhE1LkGuVK3GW9G6kQOBRI6Zc8HEH38";
    const GEMINI_API_URL =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

    // Get schedule parameters from request body
    const scheduleParams = req.body;

    // Create the Gemini API request
    const geminiPayload = {
      contents: [
        {
          parts: [
            {
              text: `Generate an optimized FLL competition schedule with the following parameters:
              
Number of Teams: ${scheduleParams.numTeams}
Number of Robot Tables: ${scheduleParams.numTables}
Number of Judging Rooms: ${scheduleParams.numJudgingRooms}
Event Start Time: ${scheduleParams.startTime}
Event End Time: ${scheduleParams.endTime}
Lunch Time: ${scheduleParams.lunchTime}
Lunch Duration: ${scheduleParams.lunchDuration} minutes
Table Run Duration: ${scheduleParams.tableDuration} minutes
Table Buffer Time: ${scheduleParams.tableBuffer} minutes
Judging Session Duration: ${scheduleParams.judgeDuration} minutes
Judging Buffer Time: ${scheduleParams.judgeBuffer} minutes
Opening Ceremony Duration: ${scheduleParams.openingDuration} minutes
Closing Ceremony Duration: ${scheduleParams.closingDuration} minutes

Please generate an optimized schedule that:
1. Includes opening and closing ceremonies for all teams
2. Provides a single unified lunch break for all teams
3. Ensures each team has proper judging sessions and table runs
4. Avoids resource conflicts (tables, judging rooms)
5. Maintains appropriate buffer times between events
6. Places activities efficiently in blocks before and after lunch

Return the result as a schedule object that includes all necessary events and timing details.`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
      },
    };

    // Call the Gemini API
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      geminiPayload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Process the Gemini response
    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates.length > 0
    ) {
      const generatedText = response.data.candidates[0].content.parts[0].text;

      // Here you would parse the generated text to extract the schedule
      // For now, we'll just return the optimization parameters to use with the existing scheduler

      const optimizedParams = {
        numTeams: scheduleParams.numTeams,
        numTables: scheduleParams.numTables,
        numJudgingRooms: scheduleParams.numJudgingRooms,
        dayStart: convertTimeToHours(scheduleParams.startTime),
        dayEnd: convertTimeToHours(scheduleParams.endTime),
        lunchTime: convertTimeToHours(scheduleParams.lunchTime),
        lunchDuration: scheduleParams.lunchDuration,
      };

      res.json({
        success: true,
        message: "Schedule optimization completed successfully",
        parameters: optimizedParams,
        aiResponse: generatedText,
      });
    } else {
      throw new Error("Invalid response from Gemini API");
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate optimized schedule",
      error: error.message,
    });
  }
});

// Helper function to convert time string to hours (e.g., "08:30" -> 8.5)
function convertTimeToHours(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours + minutes / 60;
}

export default route;
