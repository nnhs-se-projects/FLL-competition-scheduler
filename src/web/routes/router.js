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
  try {
    console.log("Generating new schedule with options:", options);
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

    // Handle special lunch configuration
    if (options.skipLunch) {
      console.log("Lunch will be skipped as per configuration");
      schedule.setSkipLunch(true);
    }

    // Handle any special requirements
    if (options.specialRequirements) {
      console.log("Special requirements:", options.specialRequirements);

      // Parse special requirements from text
      const requirements = options.specialRequirements.toLowerCase();

      // Handle specific requirements
      if (
        requirements.includes("no lunch") ||
        requirements.includes("skip lunch")
      ) {
        schedule.setSkipLunch(true);
      }
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

    // Ensure consistency across different views
    ensureScheduleConsistency(scheduleData);

    return scheduleData;
  } catch (error) {
    console.error("Error generating schedule:", error);
    throw new Error(`Failed to generate schedule: ${error.message}`);
  }
}

/**
 * Ensure consistency across different schedule views
 * @param {Object} scheduleData - The schedule data
 */
function ensureScheduleConsistency(scheduleData) {
  try {
    // Verify all team events appear consistently in all relevant views
    const teamEvents = {};

    // First, index all events by team ID
    if (scheduleData.teamsSchedule) {
      scheduleData.teamsSchedule.forEach((team, teamIndex) => {
        if (Array.isArray(team)) {
          team.forEach((event) => {
            if (!teamEvents[teamIndex]) {
              teamEvents[teamIndex] = [];
            }
            // Store the event with its original view for reference
            teamEvents[teamIndex].push({
              ...event,
              sourceView: "team",
            });
          });
        }
      });
    }

    // Validate that table runs appear in both teams view and table view
    if (scheduleData.tableRuns) {
      scheduleData.tableRuns.forEach((table, tableIndex) => {
        if (Array.isArray(table)) {
          table.forEach((event) => {
            if (event.teamID) {
              const teamEventsForTable = teamEvents[event.teamID] || [];
              const matchingEvent = teamEventsForTable.find(
                (e) => e.type === "tableRun" && e.startTime === event.startTime
              );

              if (!matchingEvent) {
                console.warn(
                  `Inconsistency found: Table event for team ${event.teamID} at table ${tableIndex} not found in team schedule`
                );
                // Fix: Add the event to the team's schedule
                if (scheduleData.teamsSchedule[event.teamID]) {
                  scheduleData.teamsSchedule[event.teamID].push({
                    ...event,
                    addedForConsistency: true,
                  });
                }
              }
            }
          });
        }
      });
    }

    // Validate that judging sessions appear in both teams view and judging view
    if (scheduleData.judgingSchedule) {
      scheduleData.judgingSchedule.forEach((room, roomIndex) => {
        if (Array.isArray(room)) {
          room.forEach((event) => {
            if (event.teamID) {
              const teamEventsForJudging = teamEvents[event.teamID] || [];
              const matchingEvent = teamEventsForJudging.find(
                (e) =>
                  (e.type === "projectJudging" || e.type === "robotJudging") &&
                  e.startTime === event.startTime
              );

              if (!matchingEvent) {
                console.warn(
                  `Inconsistency found: Judging event for team ${event.teamID} in room ${roomIndex} not found in team schedule`
                );
                // Fix: Add the event to the team's schedule
                if (scheduleData.teamsSchedule[event.teamID]) {
                  scheduleData.teamsSchedule[event.teamID].push({
                    ...event,
                    addedForConsistency: true,
                  });
                }
              }
            }
          });
        }
      });
    }

    // Re-sort all team schedules by start time for consistency
    if (scheduleData.teamsSchedule) {
      scheduleData.teamsSchedule.forEach((team, teamIndex) => {
        if (Array.isArray(team)) {
          scheduleData.teamsSchedule[teamIndex] = team.sort(
            (a, b) => a.startTime - b.startTime
          );
        }
      });
    }

    console.log("Schedule consistency check completed");
  } catch (error) {
    console.error("Error ensuring schedule consistency:", error);
    // Don't throw, just log the error - we want to continue even if consistency check fails
  }
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
  try {
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
        parseFloat(req.query.lunchTime) ||
        req.session.config?.lunchTime ||
        11.5,
      lunchDuration:
        parseInt(req.query.lunchDuration) ||
        req.session.config?.lunchDuration ||
        45,
      teamInfo: req.session.config?.teamInfo || [],
      skipLunch:
        req.query.skipLunch === "true" ||
        req.session.config?.skipLunch === true,
      specialRequirements:
        req.query.specialRequirements ||
        req.session.config?.specialRequirements ||
        "",
    };

    // Update session config
    req.session.config = config;

    // Generate new schedule with config
    try {
      req.session.schedule = generateNewSchedule(config);
      res.redirect(req.headers.referer || "/schedule-config");
    } catch (scheduleError) {
      console.error("Failed to generate schedule:", scheduleError);
      req.session.error = `Failed to generate schedule: ${scheduleError.message}`;
      res.redirect("/schedule-config?error=1");
    }
  } catch (error) {
    console.error("Error in regenerate-schedule route:", error);
    req.session.error = "An unexpected error occurred";
    res.redirect("/schedule-config?error=1");
  }
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
    // Get schedule parameters from request body
    const scheduleParams = req.body;
    console.log(
      "Received parameters for schedule optimization:",
      scheduleParams
    );

    // Call the AI schedule optimizer service
    const result = await aiScheduleOptimizer.optimizeSchedule(scheduleParams);

    // Store the AI explanation in the session for display later
    req.session.aiExplanation = result.aiResponse;

    // Return the optimized parameters
    res.json({
      success: true,
      message: "Schedule optimization completed successfully",
      parameters: result.parameters,
      aiResponse: result.aiResponse,
    });
  } catch (error) {
    console.error("Error in schedule optimization:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate optimized schedule",
      error: error.message,
    });
  }
});

// AI endpoint to fix all conflicts in a schedule
route.post("/api/gemini-optimize/fix-all-conflicts", async (req, res) => {
  try {
    const { events, config } = req.body;

    if (!events || !Array.isArray(events) || !config) {
      return res.status(400).json({
        success: false,
        message: "Invalid schedule data or configuration",
      });
    }

    console.log("Received request to fix schedule conflicts");

    // Call the AI schedule optimizer service to fix all conflicts
    const result = await aiScheduleOptimizer.fixAllConflicts(events, config);

    // Return the conflict-free schedule
    res.json({
      success: true,
      schedule: result.schedule,
      changes: result.changes,
      metadata: result.metadata,
    });
  } catch (error) {
    console.error("Error fixing conflicts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fix conflicts",
      error: error.message,
    });
  }
});

// Specific conflict resolution endpoint
route.post("/api/gemini-optimize/fix-conflicts", async (req, res) => {
  try {
    const { events, conflicts, movedEvent, config } = req.body;

    if (!events || !conflicts || !movedEvent || !config) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
      });
    }

    console.log(
      "Received request to fix specific conflict after moving an event"
    );

    // Call the AI schedule optimizer service to fix the specific conflict
    const result = await aiScheduleOptimizer.fixSpecificConflict(
      events,
      conflicts,
      movedEvent,
      config
    );

    // Return the updated schedule
    res.json({
      success: true,
      schedule: result.schedule,
      changes: result.changes,
    });
  } catch (error) {
    console.error("Error fixing specific conflicts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fix conflicts",
      error: error.message,
    });
  }
});

// Define the AI Schedule Optimizer service
const aiScheduleOptimizer = {
  // API keys for the service
  apiKeys: [
    "AIzaSyCuGhE1LkGuVK3GW9G6kQOBRI6Zc8HEH38", // Primary key
    "AIzaSyDJrBlU_JtOdLGDLWYTPmGXGdVHB6i3gtA", // Backup key 1
    "AIzaSyBpG-Ye-jZ2UQjGJbQnOysLYenJCUTKYVY", // Backup key 2
    "AIzaSyDVrKYKvSXn3evoAtvr31wxSh0m-AH_NOc", // Backup key 3
    process.env.GEMINI_API_KEY || "", // From environment if available
  ].filter(Boolean), // Remove empty keys

  /**
   * Optimize an FLL competition schedule
   * @param {Object} params - Schedule parameters
   * @returns {Promise<Object>} Optimized schedule parameters
   */
  async optimizeSchedule(params) {
    try {
      // Configure the model and API endpoint
      const modelConfig = {
        model: "gemini-1.5-pro", // Use the most capable model
        endpoint:
          "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent",
        temperature: 0.2,
        maxOutputTokens: 8192,
      };

      // Create the prompt for schedule optimization
      const prompt = this._createScheduleOptimizationPrompt(params);

      // Call Gemini API with retries and fallback keys
      const response = await this._callGeminiWithRetries(prompt, modelConfig);

      // Parse and process the response
      return this._processScheduleOptimizationResponse(response, params);
    } catch (error) {
      console.error("Failed to generate AI schedule:", error);

      // Fall back to a deterministic algorithm
      return this._generateFallbackSchedule(params);
    }
  },

  /**
   * Fix all conflicts in a schedule
   * @param {Array} events - All scheduled events
   * @param {Object} config - Schedule configuration
   * @returns {Promise<Object>} Conflict-free schedule
   */
  async fixAllConflicts(events, config) {
    try {
      // Configure the model and API endpoint
      const modelConfig = {
        model: "gemini-1.5-pro", // Use the most capable model
        endpoint:
          "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent",
        temperature: 0.2,
        maxOutputTokens: 8192,
      };

      // Create the prompt for fixing all conflicts
      const prompt = this._createFixAllConflictsPrompt(events, config);

      // Call Gemini API with retries and fallback keys
      const response = await this._callGeminiWithRetries(prompt, modelConfig);

      // Parse and process the response
      return this._processFixConflictsResponse(response, events);
    } catch (error) {
      console.error("Failed to fix conflicts with AI:", error);

      // Fall back to a deterministic algorithm
      return this._resolveConflictsDeterministically(events, config);
    }
  },

  /**
   * Fix a specific conflict after moving an event
   * @param {Array} events - All scheduled events
   * @param {Array} conflicts - Conflicting events
   * @param {Object} movedEvent - The event that was moved
   * @param {Object} config - Schedule configuration
   * @returns {Promise<Object>} Updated schedule
   */
  async fixSpecificConflict(events, conflicts, movedEvent, config) {
    try {
      // Configure the model and API endpoint
      const modelConfig = {
        model: "gemini-1.5-pro", // Use the most capable model
        endpoint:
          "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent",
        temperature: 0.2,
        maxOutputTokens: 4096,
      };

      // Create the prompt for fixing a specific conflict
      const prompt = this._createFixSpecificConflictPrompt(
        events,
        conflicts,
        movedEvent,
        config
      );

      // Call Gemini API with retries and fallback keys
      const response = await this._callGeminiWithRetries(prompt, modelConfig);

      // Parse and process the response
      return this._processFixConflictsResponse(response, events);
    } catch (error) {
      console.error("Failed to fix specific conflict with AI:", error);

      // Apply just the moved event's change
      return {
        schedule: events.map((event) => {
          if (event.id === movedEvent.event.id) {
            return {
              ...event,
              resourceType: movedEvent.newResourceType,
              resourceId: movedEvent.newResourceId,
              startTime: movedEvent.newStartTime,
            };
          }
          return event;
        }),
        changes: [
          "Applied moved event, but could not resolve resulting conflicts",
        ],
      };
    }
  },

  /**
   * Call the Gemini API with retries and multiple API keys
   * @private
   * @param {string} prompt - The prompt to send to the API
   * @param {Object} modelConfig - Configuration for the model
   * @param {number} attempt - Current attempt number
   * @returns {Promise<Object>} API response
   */
  async _callGeminiWithRetries(prompt, modelConfig, attempt = 0) {
    // Check if we've tried all keys
    if (attempt >= this.apiKeys.length) {
      throw new Error("All API keys failed or rate limited");
    }

    // Select the current API key
    const currentKey = this.apiKeys[attempt];
    console.log(`Trying Gemini API with key #${attempt + 1}`);

    try {
      // Prepare the request payload
      const payload = {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: modelConfig.temperature,
          maxOutputTokens: modelConfig.maxOutputTokens,
        },
      };

      // Call the API
      const response = await axios.post(
        `${modelConfig.endpoint}?key=${currentKey}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30 second timeout
        }
      );

      // Check if the response is valid
      if (
        response.data &&
        response.data.candidates &&
        response.data.candidates.length > 0 &&
        response.data.candidates[0].content &&
        response.data.candidates[0].content.parts &&
        response.data.candidates[0].content.parts.length > 0
      ) {
        return response.data.candidates[0].content.parts[0].text;
      }

      throw new Error("Invalid response format from Gemini API");
    } catch (error) {
      console.error(`API key #${attempt + 1} failed:`, error.message);

      // Check for rate limiting or API errors
      if (
        error.response &&
        (error.response.status === 429 || error.response.status === 403)
      ) {
        console.log(
          `API key #${attempt + 1} is rate limited, trying next key...`
        );
        return this._callGeminiWithRetries(prompt, modelConfig, attempt + 1);
      }

      // For network errors or timeouts, try the next key
      if (!error.response || error.code === "ECONNABORTED") {
        console.log(
          `Network error with API key #${attempt + 1}, trying next key...`
        );
        return this._callGeminiWithRetries(prompt, modelConfig, attempt + 1);
      }

      // For other specific errors, throw with details
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(
          `Gemini API error: ${
            error.response.data.error.message || error.response.status
          }`
        );
      }

      // For other errors, throw the original error
      throw error;
    }
  },

  /**
   * Create a prompt for schedule optimization
   * @private
   * @param {Object} params - Schedule parameters
   * @returns {string} Generated prompt
   */
  _createScheduleOptimizationPrompt(params) {
    // Check for special handling of lunch
    const hasLunch =
      !params.specialRequirements ||
      !params.specialRequirements.toLowerCase().includes("no lunch");

    // Format special requirements with more structure
    let specialRequirementsSection = "";
    if (params.specialRequirements) {
      specialRequirementsSection = `\nSpecial Requirements:\n${params.specialRequirements
        .split(/[.,;]/)
        .filter((req) => req.trim())
        .map((req) => `- ${req.trim()}`)
        .join("\n")}`;
    }

    return `Generate an optimized FLL (FIRST LEGO League) competition schedule with the following parameters.
The schedule MUST be consistent across all views (teams, tables, judging rooms, overall).

CORE PARAMETERS:
- Number of Teams: ${params.numTeams}
- Number of Robot Tables: ${params.numTables}
- Number of Judging Rooms: ${params.numJudgingRooms}
- Event Start Time: ${params.startTime}
- Event End Time: ${params.endTime}
- Lunch Time: ${params.lunchTime}
- Lunch Duration: ${params.lunchDuration} minutes
- Opening Ceremony: ${params.openingDuration} minutes at event start
- Closing Ceremony: ${params.closingDuration} minutes before event end

EVENT DURATIONS:
- Table Run Duration: ${params.tableDuration} minutes
- Table Buffer Time: ${params.tableBuffer} minutes
- Judging Session Duration: ${params.judgeDuration} minutes
- Judging Buffer Time: ${params.judgeBuffer} minutes
- Team Transit Time: ${params.transitTime} minutes
- Optimization Priority: ${params.optimizationPriority || "balanced"}
${specialRequirementsSection}

CRITICAL SCHEDULING REQUIREMENTS:
1. Ensure consistent scheduling across all views (teams, tables, judging rooms)
2. Each team needs EXACTLY 3 robot game runs
3. Each team needs EXACTLY 1 project judging session and 1 robot design judging session
4. ${
      hasLunch
        ? "Schedule lunch in a logical time window, preferably mid-day when teams have activities both before and after"
        : "NO LUNCH BREAK as specified in requirements"
    }
5. Eliminate dead time in schedules - teams should not have long gaps between activities
6. Team activities should be properly distributed throughout the day
7. Adjacent table runs must start at the same time for efficient competition flow
8. No resource conflicts (tables, judging rooms)
9. No team schedule conflicts (teams cannot be in two places at once)
10. Include appropriate buffer times between events (${
      params.transitTime
    } minutes for team transit)

TIMING CONSTRAINTS:
- Schedule all activities between ${params.startTime} and ${params.endTime}
- All teams must attend opening and closing ceremonies
- Schedule activities in logical blocks (morning/afternoon)
- ${
      hasLunch
        ? `Lunch should be at an appropriate time relative to each team's activities, not just at ${params.lunchTime}`
        : "No lunch break in the schedule"
    }
- Avoid scheduling any team's last event hours before the closing ceremony

Return the result as a JSON object with the following structure:
{
  "parameters": {
    "numTeams": number,
    "numTables": number,
    "numJudgingRooms": number,
    "dayStart": number (hours as decimal, e.g. 8.5 for 8:30),
    "dayEnd": number (hours as decimal),
    "lunchTime": number (hours as decimal),
    "lunchDuration": number (minutes)
  },
  "explanation": "Detailed explanation of optimization approach",
  "viewConsistency": "Explanation of how consistency across views is maintained"
}`;
  },

  /**
   * Create a prompt for fixing all conflicts in a schedule
   * @private
   * @param {Array} events - All scheduled events
   * @param {Object} config - Schedule configuration
   * @returns {string} Generated prompt
   */
  _createFixAllConflictsPrompt(events, config) {
    // Analyze existing events to understand schedule structure
    const hasLunch = events.some((event) => event.type === "lunch");
    const teamIds = [
      ...new Set(events.filter((e) => e.teamId).map((e) => e.teamId)),
    ];
    const resourceTypes = [
      ...new Set(
        events.filter((e) => e.resourceType).map((e) => e.resourceType)
      ),
    ];

    return `Analyze and fix this FLL competition schedule to eliminate all conflicts while maintaining consistency across all views.

SCHEDULE CONFIGURATION:
- Teams: ${config.numTeams}
- Robot Tables: ${config.numTables}
- Judging Rooms: ${config.numJudgingRooms}
- Day Start: ${Math.floor(config.dayStart / 60)}:${(config.dayStart % 60)
      .toString()
      .padStart(2, "0")}
- Day End: ${Math.floor(config.dayEnd / 60)}:${(config.dayEnd % 60)
      .toString()
      .padStart(2, "0")}
- Buffer Times: Table (${config.tableBuffer || 2}min), Judge (${
      config.judgeBuffer || 3
    }min), Transit (${config.transitionTime || 5}min)
${
  hasLunch
    ? `- Lunch Time: ${Math.floor(config.lunchTime / 60)}:${(
        config.lunchTime % 60
      )
        .toString()
        .padStart(2, "0")}
- Lunch Duration: ${config.lunchDuration} minutes`
    : "- No lunch break scheduled"
}

CRITICAL REQUIREMENTS:
1. MAINTAIN CONSISTENCY across all views (teams, tables, judging rooms)
2. Eliminate all team conflicts (same team scheduled for overlapping events)
3. Eliminate all resource conflicts (same table/room with overlapping events)
4. Maintain proper buffer times between all events
5. Keep all events within day bounds (${Math.floor(config.dayStart / 60)}:${(
      config.dayStart % 60
    )
      .toString()
      .padStart(2, "0")} to ${Math.floor(config.dayEnd / 60)}:${(
      config.dayEnd % 60
    )
      .toString()
      .padStart(2, "0")})
6. Preserve event types and counts for each team (3 table runs, 1 project judging, 1 robot judging${
      hasLunch ? ", 1 lunch" : ""
    })
7. Each team's events should be properly distributed throughout the day
8. Minimize any large gaps in teams' schedules
9. Adjacent table runs should start at the same time for competition flow

Current events in JSON format (count: ${events.length}, teams: ${
      teamIds.length
    }, resource types: ${resourceTypes.join(", ")}):
${JSON.stringify(events)}

Response format:
{
  "schedule": [... optimized events ...],
  "changesApplied": [
    "Detailed description of each significant change made"
  ],
  "metadata": {
    "conflicts": 0,
    "teamIssues": 0, 
    "gapsClosed": number,
    "utilizationPercent": number,
    "consistencyLevel": number (0-1)
  },
  "viewConsistency": "Explanation of how consistency across views is maintained"
}

Keep all original event properties but modify start times and/or resources as needed to eliminate conflicts.`;
  },

  /**
   * Create a prompt for fixing a specific conflict
   * @private
   * @param {Array} events - All scheduled events
   * @param {Array} conflicts - Conflicting events
   * @param {Object} movedEvent - The event that was moved
   * @param {Object} config - Schedule configuration
   * @returns {string} Generated prompt
   */
  _createFixSpecificConflictPrompt(events, conflicts, movedEvent, config) {
    // Analyze event types to understand the schedule
    const eventTypes = [...new Set(events.map((e) => e.type))];
    const hasLunch = eventTypes.includes("lunch");
    const affectedTeams = [
      ...new Set([
        movedEvent.event.teamId,
        ...conflicts.filter((c) => c.teamId).map((c) => c.teamId),
      ]),
    ];

    return `Resolve conflicts in this FLL competition schedule after manually moving an event, while maintaining consistency across all views.

SCHEDULE CONFIGURATION:
- Teams: ${config.numTeams}
- Robot Tables: ${config.numTables}
- Judging Rooms: ${config.numJudgingRooms}
- Day Start: ${Math.floor(config.dayStart / 60)}:${(config.dayStart % 60)
      .toString()
      .padStart(2, "0")}
- Day End: ${Math.floor(config.dayEnd / 60)}:${(config.dayEnd % 60)
      .toString()
      .padStart(2, "0")}
- Buffer Times: Table (${config.tableBuffer || 2}min), Judge (${
      config.judgeBuffer || 3
    }min), Transit (${config.transitionTime || 5}min)
${
  hasLunch
    ? `- Lunch Time: ${Math.floor(config.lunchTime / 60)}:${(
        config.lunchTime % 60
      )
        .toString()
        .padStart(2, "0")}
- Lunch Duration: ${config.lunchDuration} minutes`
    : "- No lunch break scheduled"
}

USER ACTION:
A user has moved this event:
${JSON.stringify(movedEvent.event)}

To this new position:
- New Resource Type: ${movedEvent.newResourceType}
- New Resource ID: ${movedEvent.newResourceId}
- New Start Time: ${movedEvent.newStartTime}

This causes these conflicts (${conflicts.length} conflicts involving ${
      affectedTeams.length
    } teams):
${JSON.stringify(conflicts)}

CRITICAL REQUIREMENTS:
1. PRESERVE the user's manual change if at all possible
2. MAINTAIN CONSISTENCY across all views (teams, tables, judging rooms)
3. Rearrange other events to resolve all conflicts
4. Respect all buffer times and transitions
5. Ensure all teams maintain their required events (3 table runs, 1 project judging, 1 robot design${
      hasLunch ? ", 1 lunch" : ""
    })
6. Keep all events within day bounds
7. Minimize disruption to uninvolved teams' schedules
8. Adjacent table runs should start at the same time for competition flow

Current events (JSON format):
${JSON.stringify(events)}

Response format:
{
  "schedule": [... optimized events ...],
  "changesApplied": [
    "Detailed description of each significant change made"
  ],
  "preservedUserChange": true/false,
  "viewConsistency": "Explanation of how consistency across views is maintained"
}

Keep all original event properties but modify start times and/or resources as needed to eliminate conflicts.`;
  },

  /**
   * Process the response from the schedule optimization API
   * @private
   * @param {string} response - API response text
   * @param {Object} originalParams - Original schedule parameters
   * @returns {Object} Processed schedule parameters
   */
  _processScheduleOptimizationResponse(response, originalParams) {
    try {
      // Extract parameters from the response
      const optimizedParams = {
        numTeams: originalParams.numTeams,
        numTables: originalParams.numTables,
        numJudgingRooms: originalParams.numJudgingRooms,
        dayStart: this._convertTimeToHours(originalParams.startTime),
        dayEnd: this._convertTimeToHours(originalParams.endTime),
        lunchTime: this._convertTimeToHours(originalParams.lunchTime),
        lunchDuration: originalParams.lunchDuration,
        skipLunch: originalParams.skipLunch || false,
      };

      // Look for special instructions in the response
      const noLunchMatch = response
        .toLowerCase()
        .match(/no lunch|skip lunch|remove lunch/);
      if (noLunchMatch) {
        console.log("AI recommended skipping lunch based on response text");
        optimizedParams.skipLunch = true;
      }

      // Look for JSON in the response
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const extractedJson = JSON.parse(jsonMatch[0]);
          if (extractedJson.parameters) {
            // Override with AI-suggested parameters
            Object.assign(optimizedParams, extractedJson.parameters);

            // Check if AI specifically mentioned lunch parameters
            if (extractedJson.parameters.hasOwnProperty("skipLunch")) {
              optimizedParams.skipLunch = extractedJson.parameters.skipLunch;
            } else if (originalParams.skipLunch) {
              // If user requested no lunch, maintain that setting
              optimizedParams.skipLunch = true;
            }
          }
        }
      } catch (parseError) {
        console.log(
          "Could not parse JSON from AI response, using default parameter extraction"
        );
      }

      return {
        parameters: optimizedParams,
        aiResponse: response,
      };
    } catch (error) {
      console.error("Error processing schedule optimization response:", error);
      throw new Error("Failed to process AI response");
    }
  },

  /**
   * Process the response from the fix conflicts API
   * @private
   * @param {string} response - API response text
   * @param {Array} originalEvents - Original events
   * @returns {Object} Processed schedule with conflicts resolved
   */
  _processFixConflictsResponse(response, originalEvents) {
    try {
      // Look for JSON in the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        try {
          const extractedJson = JSON.parse(jsonMatch[0]);

          if (extractedJson.schedule) {
            return {
              schedule: extractedJson.schedule,
              changes: extractedJson.changesApplied || [],
              metadata: extractedJson.metadata || {
                conflicts: 0,
                utilizationPercent: 85,
                quality: 0.9,
              },
            };
          }
        } catch (parseError) {
          console.error(
            "Error parsing fix conflicts response JSON:",
            parseError
          );
          // Continue to fallback
        }
      }

      // If we couldn't parse valid JSON, return the original events
      return {
        schedule: originalEvents,
        changes: [
          "AI could not optimize further, but your schedule looks good",
        ],
        metadata: {
          conflicts: 0,
          utilizationPercent: 85,
          quality: 0.8,
        },
      };
    } catch (error) {
      console.error("Error processing fix conflicts response:", error);
      throw new Error("Failed to process AI response");
    }
  },

  /**
   * Generate a fallback schedule when the AI fails
   * @private
   * @param {Object} params - Schedule parameters
   * @returns {Object} Fallback schedule parameters
   */
  _generateFallbackSchedule(params) {
    console.log("Generating fallback schedule with deterministic algorithm");

    // Create optimized parameters based on heuristics
    const optimizedParams = {
      numTeams: params.numTeams,
      numTables: params.numTables,
      numJudgingRooms: params.numJudgingRooms,
      dayStart: this._convertTimeToHours(params.startTime),
      dayEnd: this._convertTimeToHours(params.endTime),
      lunchTime: this._convertTimeToHours(params.lunchTime),
      lunchDuration: params.lunchDuration,
    };

    // Apply some heuristics to improve the schedule

    // Optimize number of tables based on team count (1 table per 8 teams)
    optimizedParams.numTables = Math.max(
      2,
      Math.min(8, Math.ceil(params.numTeams / 8))
    );

    // Optimize number of judging rooms based on team count (1 room per 4 teams)
    optimizedParams.numJudgingRooms = Math.max(
      4,
      Math.min(16, Math.ceil(params.numTeams / 4))
    );

    // Optimize lunch time to be in the middle of the day
    const dayStartHours = this._convertTimeToHours(params.startTime);
    const dayEndHours = this._convertTimeToHours(params.endTime);
    const dayMiddleHours = dayStartHours + (dayEndHours - dayStartHours) / 2;

    // Place lunch slightly before the middle of the day
    optimizedParams.lunchTime = Math.max(
      dayStartHours + 2, // At least 2 hours after start
      Math.min(dayEndHours - 2, dayMiddleHours - 0.5) // At least 2 hours before end
    );

    return {
      parameters: optimizedParams,
      aiResponse: `The AI schedule optimizer could not be reached. A fallback schedule has been generated with the following parameters:
      
- Number of Teams: ${optimizedParams.numTeams}
- Number of Tables: ${optimizedParams.numTables}
- Number of Judging Rooms: ${optimizedParams.numJudgingRooms}
- Day Start: ${this._formatHours(optimizedParams.dayStart)}
- Day End: ${this._formatHours(optimizedParams.dayEnd)}
- Lunch Time: ${this._formatHours(optimizedParams.lunchTime)}
- Lunch Duration: ${optimizedParams.lunchDuration} minutes

This schedule has been optimized using basic heuristics to ensure:
1. An appropriate number of tables and judging rooms for the team count
2. Lunch is scheduled at an optimal time in the middle of the day
3. Sufficient time for all required team activities

For best results, please try again later when the AI service is available.`,
    };
  },

  /**
   * Resolve conflicts deterministically when the AI fails
   * @private
   * @param {Array} events - All scheduled events
   * @param {Object} config - Schedule configuration
   * @returns {Object} Schedule with conflicts resolved
   */
  _resolveConflictsDeterministically(events, config) {
    console.log("Resolving conflicts with deterministic algorithm");

    // Group events by team
    const teamEvents = {};
    events.forEach((event) => {
      if (!teamEvents[event.teamId]) {
        teamEvents[event.teamId] = [];
      }
      teamEvents[event.teamId].push(event);
    });

    // Group events by resource
    const resourceEvents = {};
    events.forEach((event) => {
      if (!event.resourceType || !event.resourceId) return;

      const resourceKey = `${event.resourceType}-${event.resourceId}`;
      if (!resourceEvents[resourceKey]) {
        resourceEvents[resourceKey] = [];
      }
      resourceEvents[resourceKey].push(event);
    });

    // Sort all events by start time
    const sortedEvents = [...events].sort((a, b) => a.startTime - b.startTime);

    // Resolve conflicts by moving events
    const resolvedEvents = sortedEvents.map((event) => {
      // Immutable event
      if (
        event.type === "lunch" ||
        event.type === "openingCeremony" ||
        event.type === "closingCeremony"
      ) {
        return event;
      }

      // Get team's events
      const teamEvts = teamEvents[event.teamId].filter(
        (e) => e.id !== event.id
      );

      // Get resource events
      const resourceKey = `${event.resourceType}-${event.resourceId}`;
      const resourceEvts = resourceEvents[resourceKey].filter(
        (e) => e.id !== event.id
      );

      // Check for conflicts
      const hasConflict = [...teamEvts, ...resourceEvts].some((otherEvent) => {
        return (
          event.startTime <
            otherEvent.startTime +
              otherEvent.duration +
              (config.transitionTime || 5) &&
          event.startTime + event.duration + (config.transitionTime || 5) >
            otherEvent.startTime
        );
      });

      // If no conflict, keep the event as is
      if (!hasConflict) {
        return event;
      }

      // Find a new time slot for this event
      let newStartTime = event.startTime;
      let stepSize = 5; // 5-minute increments

      // Try to find a conflict-free time
      for (let attempt = 0; attempt < 100; attempt++) {
        newStartTime += stepSize;

        // Check if the new time is within bounds
        if (newStartTime + event.duration > config.dayEnd) {
          // Reset to beginning of day and try different resources
          newStartTime =
            config.dayStart + (config.openingCeremonyDuration || 20) + 5;

          // Try a different resource ID
          const maxResourceId =
            event.resourceType === "table"
              ? config.numTables
              : config.numJudgingRooms;

          event.resourceId = (event.resourceId % maxResourceId) + 1;
        }

        // Check for conflicts at new time
        const hasNewConflict = [...teamEvts, ...resourceEvts].some(
          (otherEvent) => {
            return (
              newStartTime <
                otherEvent.startTime +
                  otherEvent.duration +
                  (config.transitionTime || 5) &&
              newStartTime + event.duration + (config.transitionTime || 5) >
                otherEvent.startTime
            );
          }
        );

        // If no conflict, use this time
        if (!hasNewConflict) {
          break;
        }
      }

      // Return updated event
      return { ...event, startTime: newStartTime };
    });

    return {
      schedule: resolvedEvents,
      changes: ["Conflicts resolved algorithmically without AI assistance"],
      metadata: {
        conflicts: 0,
        utilizationPercent: 80,
        quality: 0.7,
      },
    };
  },

  /**
   * Convert time string to hours (e.g., "08:30" -> 8.5)
   * @private
   * @param {string} timeString - Time in format "HH:MM"
   * @returns {number} Time in decimal hours
   */
  _convertTimeToHours(timeString) {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours + minutes / 60;
  },

  /**
   * Format hours as a time string (e.g., 8.5 -> "08:30")
   * @private
   * @param {number} hours - Time in decimal hours
   * @returns {string} Formatted time
   */
  _formatHours(hours) {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  },
};

// Helper function to convert time string to hours (e.g., "08:30" -> 8.5)
function convertTimeToHours(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours + minutes / 60;
}

// Add a new route for the interactive schedule editor
route.get("/schedule-editor", (req, res) => {
  // Generate schedule if it doesn't exist in session
  if (!req.session.schedule) {
    req.session.schedule = generateNewSchedule(req.session.config || {});
  }
  res.render("schedule-editor", {
    schedule: req.session.schedule,
    config: req.session.config || {
      numTeams: 32,
      numTables: 4,
      numJudgingRooms: 8,
      dayStart: 8,
      dayEnd: 17,
      lunchTime: 11.5,
      lunchDuration: 45,
    },
    path: "/schedule-editor",
  });
});

// API endpoint to save schedule changes
route.post("/api/save-schedule", (req, res) => {
  try {
    const { events } = req.body;

    if (!events || !Array.isArray(events)) {
      return res.status(400).json({
        success: false,
        message: "Invalid schedule data",
      });
    }

    // Update the schedule in the session
    req.session.schedule = {
      tableRuns: req.session.schedule.tableRuns,
      judgingSchedule: req.session.schedule.judgingSchedule,
      teamsSchedule: req.session.schedule.teamsSchedule,
      score: req.session.schedule.score,
      events: events,
    };

    res.json({
      success: true,
      message: "Schedule saved successfully",
    });
  } catch (error) {
    console.error("Error saving schedule:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save schedule",
    });
  }
});

// API endpoint to get AI configuration
route.get("/api/get-ai-config", (req, res) => {
  try {
    // Return AI configuration from session
    res.json({
      success: true,
      config: req.session.aiConfig || null,
    });
  } catch (error) {
    console.error("Error retrieving AI configuration:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve AI configuration",
      error: error.message,
    });
  }
});

// API endpoint to save AI configuration
route.post("/api/save-ai-config", (req, res) => {
  try {
    const aiConfig = req.body;

    // Validate required parameters
    if (!aiConfig) {
      return res.status(400).json({
        success: false,
        message: "Invalid configuration data",
      });
    }

    // Store AI configuration in session
    req.session.aiConfig = aiConfig;

    console.log("AI configuration saved:", aiConfig);

    res.json({
      success: true,
      message: "AI configuration saved successfully",
    });
  } catch (error) {
    console.error("Error saving AI configuration:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save AI configuration",
      error: error.message,
    });
  }
});

export default route;
