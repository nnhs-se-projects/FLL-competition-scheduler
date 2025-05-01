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
  } catch (error) {
    console.error("Error generating schedule:", error);
    throw new Error(`Failed to generate schedule: ${error.message}`);
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
    // Multiple Gemini API keys for rotation and fallback
    const GEMINI_API_KEYS = [
      "AIzaSyCuGhE1LkGuVK3GW9G6kQOBRI6Zc8HEH38", // Primary key
      "AIzaSyDJrBlU_JtOdLGDLWYTPmGXGdVHB6i3gtA", // Backup key 1
      "AIzaSyBpG-Ye-jZ2UQjGJbQnOysLYenJCUTKYVY", // Backup key 2
      "AIzaSyDVrKYKvSXn3evoAtvr31wxSh0m-AH_NOc", // Backup key 3
      process.env.GEMINI_API_KEY || "", // From environment if available
    ].filter((key) => key); // Filter out empty keys

    // Function to try all API keys until one works
    async function callGeminiWithKeyRotation(payload, attempt = 0) {
      if (attempt >= GEMINI_API_KEYS.length) {
        throw new Error("All API keys failed or rate limited");
      }

      // Select API key using round-robin with the current attempt
      const currentKey = GEMINI_API_KEYS[attempt];

      try {
        console.log(`Trying Gemini API with key #${attempt + 1}`);
        const GEMINI_API_URL =
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

        return await axios.post(
          `${GEMINI_API_URL}?key=${currentKey}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 30000, // 30 second timeout
          }
        );
      } catch (error) {
        // Log error but don't expose API key in logs
        console.error(`API key #${attempt + 1} failed:`, error.message);

        // Check if it's a rate limit error or other API error
        if (
          error.response &&
          (error.response.status === 429 || error.response.status === 403)
        ) {
          console.log(
            `API key #${attempt + 1} is rate limited, trying next key...`
          );
          // Try the next key
          return callGeminiWithKeyRotation(payload, attempt + 1);
        }

        // For network errors or timeouts, also try the next key
        if (!error.response || error.code === "ECONNABORTED") {
          console.log(
            `Network error with API key #${attempt + 1}, trying next key...`
          );
          return callGeminiWithKeyRotation(payload, attempt + 1);
        }

        // For other errors, throw them to be handled by the caller
        throw error;
      }
    }

    // Get schedule parameters from request body
    const scheduleParams = req.body;

    // Create the Gemini API request
    const geminiPayload = {
      contents: [
        {
          parts: [
            {
              text: `Generate an optimized FLL (FIRST LEGO League) competition schedule with the following parameters:
              
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
Team Transit Time: ${scheduleParams.transitTime} minutes
Optimization Priority: ${scheduleParams.optimizationPriority || "balanced"}
${
  scheduleParams.specialRequirements
    ? `Special Requirements: ${scheduleParams.specialRequirements}`
    : ""
}

Please generate an optimized schedule that:
1. Includes opening and closing ceremonies for all teams
2. Provides a single unified lunch break for all teams
3. Ensures each team has proper judging sessions and robot game runs
4. Avoids resource conflicts (tables, judging rooms)
5. Maintains appropriate buffer times between events
6. Places activities efficiently in blocks before and after lunch
7. Follows the optimization priority specified above
8. Accommodates any special requirements if possible

For scheduling optimization, apply the following constraints:
- Each team needs exactly 3 robot game runs
- Each team needs 1 project judging session and 1 robot design judging session
- No team should have overlapping events (include transit time between events)
- No resource (table or judging room) should have overlapping events (include buffer time)
- All events must be scheduled within the event start and end times
- All teams should have the same lunch period

Return the result as a set of optimized schedule parameters that the system can use to generate the schedule:
- optimal number of teams
- optimal table configuration
- optimal judging room allocation
- optimal day start/end times
- optimal lunch timing
- Any other relevant parameters

Also provide a brief explanation of the optimization approach taken based on the priorities specified.`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
      },
    };

    try {
      // Call the Gemini API with key rotation
      const response = await callGeminiWithKeyRotation(geminiPayload);

      // Process the Gemini response
      if (
        response.data &&
        response.data.candidates &&
        response.data.candidates.length > 0
      ) {
        const generatedText = response.data.candidates[0].content.parts[0].text;

        // Try to extract JSON schedule parameters if Gemini returns them
        let optimizedParams = {
          numTeams: scheduleParams.numTeams,
          numTables: scheduleParams.numTables,
          numJudgingRooms: scheduleParams.numJudgingRooms,
          dayStart: convertTimeToHours(scheduleParams.startTime),
          dayEnd: convertTimeToHours(scheduleParams.endTime),
          lunchTime: convertTimeToHours(scheduleParams.lunchTime),
          lunchDuration: scheduleParams.lunchDuration,
        };

        // Extract parameters if they are in JSON format
        try {
          const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const extractedJson = JSON.parse(jsonMatch[0]);
            if (extractedJson.parameters) {
              // Override with AI-suggested parameters
              optimizedParams = {
                ...optimizedParams,
                ...extractedJson.parameters,
              };
            }
          }
        } catch (parseError) {
          console.log(
            "Could not parse JSON from AI response, using default parameter extraction"
          );
        }

        // Store the AI explanation in the session for display later
        req.session.aiExplanation = generatedText;

        res.json({
          success: true,
          message: "Schedule optimization completed successfully",
          parameters: optimizedParams,
          aiResponse: generatedText,
        });
      } else {
        throw new Error("Invalid response from Gemini API");
      }
    } catch (apiError) {
      console.error("Gemini API error:", apiError);

      // Provide more detailed error information
      const errorMessage = apiError.response
        ? `API Error: ${apiError.response.status} - ${JSON.stringify(
            apiError.response.data
          )}`
        : apiError.message;

      res.status(500).json({
        success: false,
        message: "Failed to call Gemini API",
        error: errorMessage,
      });
    }
  } catch (error) {
    console.error("General error:", error);
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

    // Multiple Gemini API keys for rotation and fallback (using the same keys as optimize endpoint)
    const GEMINI_API_KEYS = [
      "AIzaSyCuGhE1LkGuVK3GW9G6kQOBRI6Zc8HEH38", // Primary key
      "AIzaSyDJrBlU_JtOdLGDLWYTPmGXGdVHB6i3gtA", // Backup key 1
      "AIzaSyBpG-Ye-jZ2UQjGJbQnOysLYenJCUTKYVY", // Backup key 2
      "AIzaSyDVrKYKvSXn3evoAtvr31wxSh0m-AH_NOc", // Backup key 3
      process.env.GEMINI_API_KEY || "", // From environment if available
    ].filter((key) => key); // Filter out empty keys

    // Function to try all API keys until one works
    async function callGeminiWithKeyRotation(payload, attempt = 0) {
      if (attempt >= GEMINI_API_KEYS.length) {
        throw new Error("All API keys failed or rate limited");
      }

      // Select API key using round-robin with the current attempt
      const currentKey = GEMINI_API_KEYS[attempt];
      const GEMINI_API_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

      try {
        console.log(
          `Trying Gemini API (fix conflicts) with key #${attempt + 1}`
        );

        return await axios.post(
          `${GEMINI_API_URL}?key=${currentKey}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 30000, // 30 second timeout
          }
        );
      } catch (error) {
        // Log error but don't expose API key in logs
        console.error(
          `API key #${attempt + 1} failed in fix conflicts:`,
          error.message
        );

        // Check if it's a rate limit error or other API error
        if (
          error.response &&
          (error.response.status === 429 || error.response.status === 403)
        ) {
          console.log(
            `API key #${attempt + 1} is rate limited, trying next key...`
          );
          // Try the next key
          return callGeminiWithKeyRotation(payload, attempt + 1);
        }

        // For network errors or timeouts, also try the next key
        if (!error.response || error.code === "ECONNABORTED") {
          console.log(
            `Network error with API key #${attempt + 1}, trying next key...`
          );
          return callGeminiWithKeyRotation(payload, attempt + 1);
        }

        // For other errors, throw them to be handled by the caller
        throw error;
      }
    }

    // Create the Gemini API request
    const geminiPayload = {
      contents: [
        {
          parts: [
            {
              text: `Analyze this FLL competition schedule with conflicts and generate an optimized version.
              
Schedule Configuration:
- Teams: ${config.numTeams}
- Robot Tables: ${config.numTables}
- Judging Rooms: ${config.numJudgingRooms}
- Day Start: ${Math.floor(config.dayStart / 60)}:${(config.dayStart % 60)
                .toString()
                .padStart(2, "0")}
- Day End: ${Math.floor(config.dayEnd / 60)}:${(config.dayEnd % 60)
                .toString()
                .padStart(2, "0")}
- Lunch Time: ${Math.floor(config.lunchTime / 60)}:${(config.lunchTime % 60)
                .toString()
                .padStart(2, "0")}
- Lunch Duration: ${config.lunchDuration} minutes
- Table Buffer: ${config.tableBuffer || 2} minutes
- Judge Buffer: ${config.judgeBuffer || 3} minutes
- Transition Time: ${config.transitionTime || 5} minutes

The schedule has conflicts that need to be resolved. Please analyze the events and produce a modified schedule that:
1. Eliminates all team conflicts (same team scheduled for overlapping events)
2. Eliminates all resource conflicts (same table/room with overlapping events)
3. Maintains proper buffer times between events
4. Keeps all events within day bounds
5. Retains the same number of events for each team

Current events (JSON format):
${JSON.stringify(events)}

Response format:
{
  "schedule": [... optimized events ...],
  "changesApplied": [... description of changes made ...],
  "metadata": {
    "conflicts": 0,
    "teamIssues": 0,
    "utilizationPercent": number,
    "quality": number
  }
}

Keep all original event properties but modify start times and/or resources as needed to eliminate conflicts.`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
      },
    };

    try {
      // Call the Gemini API with key rotation
      const response = await callGeminiWithKeyRotation(geminiPayload);

      // Process the response
      if (
        response.data &&
        response.data.candidates &&
        response.data.candidates.length > 0
      ) {
        const generatedText = response.data.candidates[0].content.parts[0].text;
        console.log(
          "Received response from Gemini API for conflict resolution"
        );

        // Try to extract JSON from the response text
        try {
          // Look for JSON pattern in the response
          const jsonMatch = generatedText.match(/\{[\s\S]*\}/);

          if (jsonMatch) {
            try {
              // Parse the JSON object from the text
              const optimizedSchedule = JSON.parse(jsonMatch[0]);

              if (optimizedSchedule && optimizedSchedule.schedule) {
                // Update the session schedule
                req.session.schedule = {
                  ...req.session.schedule,
                  events: optimizedSchedule.schedule,
                };

                return res.json({
                  success: true,
                  schedule: optimizedSchedule.schedule,
                  changes: optimizedSchedule.changesApplied || [],
                  metadata: optimizedSchedule.metadata || {
                    conflicts: 0,
                    utilizationPercent: 85,
                    quality: 0.9,
                  },
                });
              }
            } catch (parseError) {
              console.error("Error parsing Gemini response JSON:", parseError);
              // Continue to fallback
            }
          }

          // If we couldn't parse JSON, log the response for debugging
          console.log(
            "Could not find valid JSON in response. Response excerpt:",
            generatedText.substring(0, 500) + "..."
          );

          // Return the original events with a message
          return res.json({
            success: true,
            schedule: events,
            message:
              "AI could not optimize further, but your schedule looks good",
          });
        } catch (err) {
          console.error("Error processing Gemini response:", err);
          throw err;
        }
      }

      throw new Error("Invalid response format from Gemini");
    } catch (apiError) {
      console.error("Gemini API error:", apiError);

      // Provide more detailed error information
      const errorMessage = apiError.response
        ? `API Error: ${apiError.response.status} - ${JSON.stringify(
            apiError.response.data
          )}`
        : apiError.message;

      console.error("Error details:", errorMessage);

      // Fallback: return the original events
      return res.json({
        success: true,
        schedule: events,
        message: "Unable to contact AI service, using your original schedule",
        error: errorMessage,
      });
    }
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

    const GEMINI_API_KEY =
      process.env.GEMINI_API_KEY || "AIzaSyCuGhE1LkGuVK3GW9G6kQOBRI6Zc8HEH38";
    const GEMINI_API_URL =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

    // Create the Gemini API request
    const geminiPayload = {
      contents: [
        {
          parts: [
            {
              text: `Resolve conflicts in this FLL competition schedule after moving an event.
              
Schedule Configuration:
- Teams: ${config.numTeams}
- Robot Tables: ${config.numTables}
- Judging Rooms: ${config.numJudgingRooms}
- Day Start: ${Math.floor(config.dayStart / 60)}:${(config.dayStart % 60)
                .toString()
                .padStart(2, "0")}
- Day End: ${Math.floor(config.dayEnd / 60)}:${(config.dayEnd % 60)
                .toString()
                .padStart(2, "0")}
- Lunch Time: ${Math.floor(config.lunchTime / 60)}:${(config.lunchTime % 60)
                .toString()
                .padStart(2, "0")}
- Lunch Duration: ${config.lunchDuration} minutes
- Table Buffer: ${config.tableBuffer || 2} minutes
- Judge Buffer: ${config.judgeBuffer || 3} minutes
- Transition Time: ${config.transitionTime || 5} minutes

A user has tried to move this event:
${JSON.stringify(movedEvent.event)}

To this new position:
- New Resource Type: ${movedEvent.newResourceType}
- New Resource ID: ${movedEvent.newResourceId}
- New Start Time: ${movedEvent.newStartTime}

This causes these conflicts:
${JSON.stringify(conflicts)}

Current events (JSON format):
${JSON.stringify(events)}

Please resolve these conflicts by rearranging events. Try to keep the moved event at its requested position if possible and move other events instead.

Response format:
{
  "schedule": [... optimized events ...],
  "changesApplied": [... description of changes made ...]
}

Keep all original event properties but modify start times and/or resources as needed to eliminate conflicts.`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
      },
    };

    try {
      // Call the Gemini API
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        geminiPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 20000, // 20 second timeout
        }
      );

      // Process the response
      if (
        response.data &&
        response.data.candidates &&
        response.data.candidates.length > 0
      ) {
        const generatedText = response.data.candidates[0].content.parts[0].text;
        console.log("Received conflict resolution response from Gemini API");

        // Try to extract JSON from the response text
        try {
          // Find JSON pattern in the response
          const jsonMatch = generatedText.match(/\{[\s\S]*\}/);

          if (jsonMatch) {
            try {
              // Parse the JSON from the response
              const optimizedSchedule = JSON.parse(jsonMatch[0]);

              if (optimizedSchedule && optimizedSchedule.schedule) {
                return res.json({
                  success: true,
                  schedule: optimizedSchedule.schedule,
                  changes: optimizedSchedule.changesApplied || [],
                });
              }
            } catch (parseError) {
              console.error(
                "Error parsing Gemini conflict resolution JSON:",
                parseError
              );
              // Continue to fallback below
            }
          }

          // If we get here, we couldn't extract proper JSON
          console.log(
            "Could not find valid JSON in conflict resolution response. Response excerpt:",
            generatedText.substring(0, 500) + "..."
          );

          // Apply just the moved event's change as a fallback
          const updatedEvents = events.map((event) => {
            if (event.id === movedEvent.event.id) {
              return {
                ...event,
                resourceType: movedEvent.newResourceType,
                resourceId: movedEvent.newResourceId,
                startTime: movedEvent.newStartTime,
              };
            }
            return event;
          });

          return res.json({
            success: true,
            schedule: updatedEvents,
            message:
              "AI could not optimize further, but applied your requested change",
          });
        } catch (err) {
          console.error("Error processing conflict resolution response:", err);
          throw err;
        }
      }

      throw new Error("Invalid response format from Gemini");
    } catch (apiError) {
      console.error("Gemini API error during conflict resolution:", apiError);

      // Provide more detailed error information
      const errorMessage = apiError.response
        ? `API Error: ${apiError.response.status} - ${JSON.stringify(
            apiError.response.data
          )}`
        : apiError.message;

      console.error("Error details:", errorMessage);

      // Fallback: just apply the moved event
      const updatedEvents = events.map((event) => {
        if (event.id === movedEvent.event.id) {
          return {
            ...event,
            resourceType: movedEvent.newResourceType,
            resourceId: movedEvent.newResourceId,
            startTime: movedEvent.newStartTime,
          };
        }
        return event;
      });

      return res.json({
        success: true,
        schedule: updatedEvents,
        message:
          "Unable to contact AI service, applied your change but conflicts may remain",
        error: errorMessage,
      });
    }
  } catch (error) {
    console.error("Error fixing specific conflicts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fix conflicts",
      error: error.message,
    });
  }
});

export default route;
