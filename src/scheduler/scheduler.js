/**
 * FLL Competition Scheduler - Main Scheduler Module
 *
 * This file contains the main scheduling logic for generating and evaluating FLL competition schedules.
 */

import CONFIG from "./config.js";
import { Event, Schedule } from "./models.js";
import { generateSimpleSchedule } from "./simpleScheduler.js";
import { optimizeSchedule } from "./geneticAlgorithm.js";
import { generateTeamName } from "../utils/utils.js";

/**
 * Create a randomized schedule
 * @returns {Schedule} A randomized schedule
 */
function createRandomSchedule() {
  const schedule = new Schedule();

  // Schedule opening ceremony
  scheduleOpeningCeremony(schedule);

  // First block - Activities before lunch
  const lunchStartTime = CONFIG.DAY_START + CONFIG.CEREMONIES.LUNCH_START;
  const firstBlockEndTime = lunchStartTime;

  // Schedule project judging sessions
  scheduleProjectJudging(schedule, firstBlockEndTime);

  // Schedule robot design judging sessions
  scheduleRobotDesignJudging(schedule, firstBlockEndTime);

  // Schedule table runs (first round)
  scheduleTableRuns(
    schedule,
    0,
    Math.ceil(CONFIG.ROUNDS_PER_TEAM / 2),
    firstBlockEndTime
  );

  // Schedule lunch break
  scheduleLunch(schedule);

  // Second block - Activities after lunch
  const lunchEndTime = lunchStartTime + CONFIG.DURATIONS.LUNCH_DURATION;
  const secondBlockEndTime = CONFIG.DAY_END - CONFIG.DURATIONS.CLOSING_CEREMONY;

  // Schedule remaining table runs
  scheduleTableRuns(
    schedule,
    Math.ceil(CONFIG.ROUNDS_PER_TEAM / 2),
    CONFIG.ROUNDS_PER_TEAM,
    secondBlockEndTime
  );

  // Schedule closing ceremony
  scheduleClosingCeremony(schedule);

  // Sort events by start time
  schedule.sortByStartTime();

  return schedule;
}

/**
 * Schedule opening ceremony
 * @param {Schedule} schedule - The schedule to add event to
 */
function scheduleOpeningCeremony(schedule) {
  const startTime = CONFIG.DAY_START + CONFIG.CEREMONIES.OPENING_START;

  // Create a single opening ceremony event that all teams attend
  for (let teamId = 1; teamId <= CONFIG.NUM_TEAMS; teamId++) {
    const event = new Event(
      teamId,
      generateTeamName(teamId),
      startTime,
      CONFIG.DURATIONS.OPENING_CEREMONY,
      0, // Location ID doesn't matter for ceremonies
      "Main Area",
      CONFIG.EVENT_TYPES.OPENING_CEREMONY,
      "ceremony"
    );

    schedule.addEvent(event);
  }
}

/**
 * Schedule project judging sessions
 * @param {Schedule} schedule - The schedule to add events to
 * @param {number} blockEndTime - End time of the current block
 */
function scheduleProjectJudging(schedule, blockEndTime) {
  const numProjectRooms = Math.ceil(CONFIG.NUM_JUDGING_ROOMS / 2);
  const sessionDuration = CONFIG.DURATIONS.JUDGING_SESSION;
  const bufferTime = CONFIG.DURATIONS.JUDGE_BUFFER;

  // Start after opening ceremony
  const startTimeBase =
    CONFIG.DAY_START +
    CONFIG.CEREMONIES.OPENING_START +
    CONFIG.DURATIONS.OPENING_CEREMONY +
    bufferTime;

  for (let teamId = 1; teamId <= CONFIG.NUM_TEAMS; teamId++) {
    // Assign a room
    const roomId = (teamId - 1) % numProjectRooms;

    // Calculate start time with scheduled slots
    const slot = Math.floor((teamId - 1) / numProjectRooms);
    let startTime = startTimeBase + slot * (sessionDuration + bufferTime);

    // Ensure we're within block bounds
    if (startTime + sessionDuration > blockEndTime) {
      console.warn(
        `Warning: First block not long enough for all project judging sessions, team ${teamId} will be scheduled after lunch`
      );
      // Start scheduling after lunch if we run out of time
      startTime =
        CONFIG.DAY_START +
        CONFIG.CEREMONIES.LUNCH_START +
        CONFIG.DURATIONS.LUNCH_DURATION +
        bufferTime +
        (slot -
          Math.floor(
            (blockEndTime - startTimeBase) / (sessionDuration + bufferTime)
          )) *
          (sessionDuration + bufferTime);
    }

    // Create and add the project judging event
    const event = new Event(
      teamId,
      generateTeamName(teamId),
      startTime,
      sessionDuration,
      roomId,
      `Project Room ${roomId + 1}`,
      CONFIG.EVENT_TYPES.PROJECT_JUDGING,
      "judging"
    );

    schedule.addEvent(event);
  }
}

/**
 * Schedule robot design judging sessions
 * @param {Schedule} schedule - The schedule to add events to
 * @param {number} blockEndTime - End time of the current block
 */
function scheduleRobotDesignJudging(schedule, blockEndTime) {
  const numProjectRooms = Math.ceil(CONFIG.NUM_JUDGING_ROOMS / 2);
  const numRobotRooms = Math.floor(CONFIG.NUM_JUDGING_ROOMS / 2);
  const sessionDuration = CONFIG.DURATIONS.JUDGING_SESSION;
  const bufferTime = CONFIG.DURATIONS.JUDGE_BUFFER;

  // Start after opening ceremony with offset from project judging
  const startTimeBase =
    CONFIG.DAY_START +
    CONFIG.CEREMONIES.OPENING_START +
    CONFIG.DURATIONS.OPENING_CEREMONY +
    bufferTime +
    Math.ceil(CONFIG.NUM_TEAMS / (CONFIG.NUM_JUDGING_ROOMS * 2)) *
      (sessionDuration / 2);

  for (let teamId = 1; teamId <= CONFIG.NUM_TEAMS; teamId++) {
    // Assign a room (offset from project rooms)
    const roomId = ((teamId - 1) % numRobotRooms) + numProjectRooms;

    // Calculate start time with scheduled slots, offset to interleave with project judging
    const slot = Math.floor((teamId - 1) / numRobotRooms);
    let startTime = startTimeBase + slot * (sessionDuration + bufferTime);

    // Check for conflicts with existing team events
    const teamEvents = schedule.getTeamEvents(teamId);
    let hasConflict = true;
    let attempts = 0;
    const maxAttempts = 20;

    while (hasConflict && attempts < maxAttempts) {
      hasConflict = false;
      attempts++;

      for (const existingEvent of teamEvents) {
        if (
          startTime <
            existingEvent.getEndTime() + CONFIG.DURATIONS.MIN_TRANSITION_TIME &&
          startTime + sessionDuration + CONFIG.DURATIONS.MIN_TRANSITION_TIME >
            existingEvent.startTime
        ) {
          hasConflict = true;
          startTime =
            existingEvent.getEndTime() + CONFIG.DURATIONS.MIN_TRANSITION_TIME;
          break;
        }
      }

      // Check block bounds after potential adjustment
      if (startTime + sessionDuration > blockEndTime) {
        console.warn(
          `Warning: First block not long enough for robot design judging for team ${teamId}, scheduling after lunch`
        );
        // Start scheduling after lunch if we run out of time
        startTime =
          CONFIG.DAY_START +
          CONFIG.CEREMONIES.LUNCH_START +
          CONFIG.DURATIONS.LUNCH_DURATION +
          bufferTime;
        // Try again with the new time
        continue;
      }
    }

    // Skip this event if we couldn't resolve conflicts
    if (attempts >= maxAttempts) {
      console.warn(
        `Warning: Unable to schedule robot design judging for team ${teamId} after ${maxAttempts} attempts`
      );
      continue;
    }

    // Create and add the robot design judging event
    const event = new Event(
      teamId,
      generateTeamName(teamId),
      startTime,
      sessionDuration,
      roomId,
      `Robot Design Room ${roomId - numProjectRooms + 1}`,
      CONFIG.EVENT_TYPES.ROBOT_JUDGING,
      "judging"
    );

    schedule.addEvent(event);
  }
}

/**
 * Schedule lunch break for all teams
 * @param {Schedule} schedule - The schedule to add events to
 */
function scheduleLunch(schedule) {
  const lunchStartTime = CONFIG.DAY_START + CONFIG.CEREMONIES.LUNCH_START;
  const lunchDuration = CONFIG.DURATIONS.LUNCH_DURATION;

  // Create a lunch event for each team - all teams have lunch at the same time
  for (let teamId = 1; teamId <= CONFIG.NUM_TEAMS; teamId++) {
    const event = new Event(
      teamId,
      generateTeamName(teamId),
      lunchStartTime,
      lunchDuration,
      0, // Location ID doesn't matter for lunch
      "Cafeteria",
      CONFIG.EVENT_TYPES.LUNCH,
      "break"
    );

    schedule.addEvent(event);
  }
}

/**
 * Schedule closing ceremony
 * @param {Schedule} schedule - The schedule to add event to
 */
function scheduleClosingCeremony(schedule) {
  const startTime = CONFIG.DAY_END - CONFIG.DURATIONS.CLOSING_CEREMONY;

  // Create a single closing ceremony event that all teams attend
  for (let teamId = 1; teamId <= CONFIG.NUM_TEAMS; teamId++) {
    const event = new Event(
      teamId,
      generateTeamName(teamId),
      startTime,
      CONFIG.DURATIONS.CLOSING_CEREMONY,
      0, // Location ID doesn't matter for ceremonies
      "Main Area",
      CONFIG.EVENT_TYPES.CLOSING_CEREMONY,
      "ceremony"
    );

    schedule.addEvent(event);
  }
}

/**
 * Schedule table runs for all teams
 * @param {Schedule} schedule - The schedule to add events to
 * @param {number} startRound - First round to schedule (0-indexed)
 * @param {number} endRound - Last round to schedule (exclusive)
 * @param {number} blockEndTime - End time of the current block
 */
function scheduleTableRuns(schedule, startRound, endRound, blockEndTime) {
  const numTables = CONFIG.NUM_ROBOT_TABLES;
  const runDuration = CONFIG.DURATIONS.TABLE_RUN;
  const bufferTime = CONFIG.DURATIONS.TABLE_BUFFER;

  // Start time based on which block we're in
  let blockStartTime;
  if (startRound === 0) {
    // First block - after opening ceremony
    blockStartTime =
      CONFIG.DAY_START +
      CONFIG.CEREMONIES.OPENING_START +
      CONFIG.DURATIONS.OPENING_CEREMONY +
      bufferTime;
  } else {
    // Second block - after lunch
    blockStartTime =
      CONFIG.DAY_START +
      CONFIG.CEREMONIES.LUNCH_START +
      CONFIG.DURATIONS.LUNCH_DURATION +
      bufferTime;
  }

  // For each round
  for (let round = startRound; round < endRound; round++) {
    // For each team
    for (let teamId = 1; teamId <= CONFIG.NUM_TEAMS; teamId++) {
      // Assign a table - distribute teams evenly
      const tableId = (teamId - 1 + round) % numTables;

      // Calculate start time with fixed 5-minute slots
      const slot =
        ((round - startRound) * CONFIG.NUM_TEAMS + teamId - 1) %
        (Math.floor(
          (blockEndTime - blockStartTime) / (runDuration + bufferTime)
        ) *
          numTables);
      let startTime =
        blockStartTime +
        Math.floor(slot / numTables) * (runDuration + bufferTime);

      // Check for conflicts with existing team events
      const teamEvents = schedule.getTeamEvents(teamId);
      let hasConflict = true;
      let attempts = 0;
      const maxAttempts = 30;

      while (hasConflict && attempts < maxAttempts) {
        hasConflict = false;
        attempts++;

        // Check team conflicts
        for (const existingEvent of teamEvents) {
          if (
            startTime <
              existingEvent.getEndTime() +
                CONFIG.DURATIONS.MIN_TRANSITION_TIME &&
            startTime + runDuration + CONFIG.DURATIONS.MIN_TRANSITION_TIME >
              existingEvent.startTime
          ) {
            hasConflict = true;
            startTime =
              existingEvent.getEndTime() + CONFIG.DURATIONS.MIN_TRANSITION_TIME;
            break;
          }
        }

        // If no team conflicts, check table conflicts
        if (!hasConflict) {
          const tableEvents = schedule.getResourceEvents(`table-${tableId}`);

          for (const existingEvent of tableEvents) {
            if (
              startTime < existingEvent.getEndTime() + bufferTime &&
              startTime + runDuration + bufferTime > existingEvent.startTime
            ) {
              hasConflict = true;
              startTime = existingEvent.getEndTime() + bufferTime;
              break;
            }
          }
        }

        // Check block bounds
        if (startTime + runDuration > blockEndTime) {
          console.warn(
            `Warning: Block not long enough for table run for team ${teamId} in round ${
              round + 1
            }`
          );
          hasConflict = false; // Exit the loop, but we'll skip this event
          break;
        }
      }

      // Skip this event if we couldn't resolve conflicts
      if (attempts >= maxAttempts) {
        console.warn(
          `Warning: Unable to schedule table run for team ${teamId} in round ${
            round + 1
          } after ${maxAttempts} attempts`
        );
        continue;
      }

      // Create and add the table run event
      const event = new Event(
        teamId,
        generateTeamName(teamId),
        startTime,
        runDuration,
        tableId,
        `Table ${tableId + 1}`,
        CONFIG.EVENT_TYPES.TABLE_RUN,
        "table"
      );

      schedule.addEvent(event);
    }
  }
}

/**
 * Evaluate a schedule and return a score
 * @param {Schedule} schedule - The schedule to evaluate
 * @returns {number} A score between 0 and 1
 */
function evaluateSchedule(schedule) {
  // Check day bounds
  if (!schedule.isWithinDayBounds()) {
    return 0.0;
  }

  // Check team conflicts
  if (!schedule.hasNoTeamOverlaps()) {
    return 0.0;
  }

  // Check resource conflicts
  if (!schedule.hasNoResourceOverlaps()) {
    return 0.0;
  }

  // Check that each team has the correct number of events
  const teamSchedule = schedule.buildTeamSchedule();

  for (const teamId in teamSchedule) {
    const teamEvents = teamSchedule[teamId];

    // Count the different types of events
    let tableRunCount = 0;
    let projectJudgingCount = 0;
    let robotJudgingCount = 0;
    let lunchCount = 0;
    let openingCount = 0;
    let closingCount = 0;

    for (const event of teamEvents) {
      if (event.type === CONFIG.EVENT_TYPES.TABLE_RUN) {
        tableRunCount++;
      } else if (event.type === CONFIG.EVENT_TYPES.PROJECT_JUDGING) {
        projectJudgingCount++;
      } else if (event.type === CONFIG.EVENT_TYPES.ROBOT_JUDGING) {
        robotJudgingCount++;
      } else if (event.type === CONFIG.EVENT_TYPES.LUNCH) {
        lunchCount++;
      } else if (event.type === CONFIG.EVENT_TYPES.OPENING_CEREMONY) {
        openingCount++;
      } else if (event.type === CONFIG.EVENT_TYPES.CLOSING_CEREMONY) {
        closingCount++;
      }
    }

    // Each team should have all required events
    if (
      tableRunCount !== CONFIG.ROUNDS_PER_TEAM ||
      projectJudgingCount !== 1 ||
      robotJudgingCount !== 1 ||
      lunchCount !== 1 ||
      openingCount !== 1 ||
      closingCount !== 1
    ) {
      return 0.0; // Invalid schedule
    }
  }

  // Calculate utilization and efficiency scores
  const utilizationScore = calculateUtilizationScore(schedule);
  const efficiencyScore = calculateEfficiencyScore(schedule);
  const flowScore = calculateFlowScore(schedule);

  // Combine scores - weighted toward utilization and efficiency
  return 0.4 * utilizationScore + 0.4 * efficiencyScore + 0.2 * flowScore;
}

/**
 * Calculate a utilization score based on how efficiently the schedule uses time
 * @param {Schedule} schedule - The schedule to evaluate
 * @returns {number} A score between 0 and 1
 */
function calculateUtilizationScore(schedule) {
  // Calculate total event time (excluding ceremonies and lunch)
  let totalEventTime = 0;
  for (const event of schedule.getAllEvents()) {
    if (
      event.type !== CONFIG.EVENT_TYPES.LUNCH &&
      event.type !== CONFIG.EVENT_TYPES.OPENING_CEREMONY &&
      event.type !== CONFIG.EVENT_TYPES.CLOSING_CEREMONY
    ) {
      totalEventTime += event.duration;
    }
  }

  // Calculate total available time (excluding ceremonies and lunch)
  const totalDayTime =
    CONFIG.DAY_END -
    CONFIG.DAY_START -
    CONFIG.DURATIONS.OPENING_CEREMONY -
    CONFIG.DURATIONS.LUNCH_DURATION -
    CONFIG.DURATIONS.CLOSING_CEREMONY;

  const totalResourceTime =
    totalDayTime * (CONFIG.NUM_ROBOT_TABLES + CONFIG.NUM_JUDGING_ROOMS);

  // Calculate utilization as a percentage of available time
  const utilization = Math.min(1.0, totalEventTime / totalResourceTime);

  return utilization;
}

/**
 * Calculate an efficiency score based on minimizing idle time for teams
 * @param {Schedule} schedule - The schedule to evaluate
 * @returns {number} A score between 0 and 1
 */
function calculateEfficiencyScore(schedule) {
  let totalIdleTime = 0;
  let totalPossibleIdleTime = 0;

  for (let teamId = 1; teamId <= CONFIG.NUM_TEAMS; teamId++) {
    // Get all non-ceremony events
    const teamEvents = schedule
      .getTeamEvents(teamId)
      .filter(
        (event) =>
          event.type !== CONFIG.EVENT_TYPES.OPENING_CEREMONY &&
          event.type !== CONFIG.EVENT_TYPES.CLOSING_CEREMONY
      )
      .sort((a, b) => a.startTime - b.startTime);

    // Skip teams with no events or only one event
    if (teamEvents.length <= 1) {
      continue;
    }

    // Calculate idle time for each block (before and after lunch)
    for (const block of ["before", "after"]) {
      let blockEvents;

      if (block === "before") {
        const lunchStartTime = CONFIG.DAY_START + CONFIG.CEREMONIES.LUNCH_START;
        blockEvents = teamEvents.filter(
          (event) =>
            event.type !== CONFIG.EVENT_TYPES.LUNCH &&
            event.startTime < lunchStartTime
        );
      } else {
        const lunchEndTime =
          CONFIG.DAY_START +
          CONFIG.CEREMONIES.LUNCH_START +
          CONFIG.DURATIONS.LUNCH_DURATION;
        blockEvents = teamEvents.filter(
          (event) =>
            event.type !== CONFIG.EVENT_TYPES.LUNCH &&
            event.startTime >= lunchEndTime
        );
      }

      if (blockEvents.length <= 1) continue;

      // Calculate total block span (from first event start to last event end)
      const firstEventStart = blockEvents[0].startTime;
      const lastEventEnd = blockEvents[blockEvents.length - 1].getEndTime();
      const blockSpan = lastEventEnd - firstEventStart;

      // Calculate total event time for this team in this block
      let blockEventTime = 0;
      for (const event of blockEvents) {
        blockEventTime += event.duration;
      }

      // Calculate idle time (excluding required transition time)
      const minimumTransitionTime =
        (blockEvents.length - 1) * CONFIG.DURATIONS.MIN_TRANSITION_TIME;
      const idleTime = Math.max(
        0,
        blockSpan - blockEventTime - minimumTransitionTime
      );

      totalIdleTime += idleTime;
      totalPossibleIdleTime += blockSpan;
    }
  }

  // Avoid division by zero
  if (totalPossibleIdleTime === 0) {
    return 1.0;
  }

  // Invert the score so that less idle time = higher score
  const rawScore = 1 - totalIdleTime / totalPossibleIdleTime;

  // Normalize the score (0.5 to 1.0 range) to avoid overly penalizing
  return 0.5 + rawScore * 0.5;
}

/**
 * Calculate a flow score based on how well the events follow a logical sequence
 * @param {Schedule} schedule - The schedule to evaluate
 * @returns {number} A score between 0 and 1
 */
function calculateFlowScore(schedule) {
  let totalScore = 0;

  for (let teamId = 1; teamId <= CONFIG.NUM_TEAMS; teamId++) {
    const teamEvents = schedule
      .getTeamEvents(teamId)
      .sort((a, b) => a.startTime - b.startTime);

    // Skip teams with insufficient events
    if (teamEvents.length < 5) continue;

    // Check if opening ceremony is first
    if (teamEvents[0].type === CONFIG.EVENT_TYPES.OPENING_CEREMONY) {
      totalScore += 0.2;
    }

    // Check if lunch is in the middle
    const lunchIndex = teamEvents.findIndex(
      (event) => event.type === CONFIG.EVENT_TYPES.LUNCH
    );
    const idealLunchPosition = Math.floor(teamEvents.length / 2);

    // Give higher score the closer lunch is to the middle
    if (lunchIndex !== -1) {
      const lunchPositionScore =
        1 - Math.abs(lunchIndex - idealLunchPosition) / teamEvents.length;
      totalScore += lunchPositionScore * 0.4;
    }

    // Check if closing ceremony is last
    if (
      teamEvents[teamEvents.length - 1].type ===
      CONFIG.EVENT_TYPES.CLOSING_CEREMONY
    ) {
      totalScore += 0.4;
    }
  }

  return totalScore / CONFIG.NUM_TEAMS;
}

/**
 * Generate a complete schedule
 * @param {boolean} useGeneticAlgorithm - Whether to use the genetic algorithm
 * @returns {Schedule} A complete schedule
 */
function generateSchedule(useGeneticAlgorithm = true) {
  let schedule;

  try {
    // We can use one of two approaches to generate the initial schedule:

    // Option 1: Create a random schedule directly
    schedule = createRandomSchedule();

    // Evaluate the initial schedule
    const initialScore = evaluateSchedule(schedule);
    schedule.score = initialScore;

    // If the initial score is 0, fall back to simple scheduler
    if (initialScore === 0) {
      console.warn(
        "Initial schedule invalid, falling back to simple scheduler"
      );
      schedule = generateSimpleSchedule();
    }

    // Use genetic algorithm to optimize if requested
    if (useGeneticAlgorithm) {
      try {
        schedule = optimizeSchedule(schedule);
      } catch (error) {
        console.error("Error during genetic optimization:", error);
        // Fall back to the unoptimized schedule
      }
    }
  } catch (error) {
    console.error("Error generating schedule:", error);
    // Create a simple schedule as a fallback
    schedule = generateSimpleSchedule();
  }

  return schedule;
}

export { createRandomSchedule, evaluateSchedule, generateSchedule };
