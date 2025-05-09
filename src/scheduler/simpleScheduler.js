/**
 * FLL Competition Scheduler - Simple Version
 *
 * This file contains a simplified version of the scheduling logic
 * that focuses on just creating a basic valid schedule.
 */

import CONFIG from "./config.js";
import { Event, Schedule } from "./models.js";
import { generateTeamName } from "../utils/utils.js";

/**
 * Generate a simple but valid FLL competition schedule
 * @returns {Schedule} A valid schedule
 */
function generateSimpleSchedule() {
  const schedule = new Schedule();

  // Create a sequential schedule without randomization
  // This ensures we can create a valid schedule

  // Step 1: Schedule opening ceremony
  scheduleOpeningCeremony(schedule);

  // Calculate time blocks
  const lunchStartTime = CONFIG.DAY_START + CONFIG.CEREMONIES.LUNCH_START;
  const lunchEndTime = lunchStartTime + CONFIG.DURATIONS.LUNCH_DURATION;
  const closingStartTime = CONFIG.DAY_END - CONFIG.DURATIONS.CLOSING_CEREMONY;

  // Step 2: Schedule sessions before lunch
  const morningEndTime = lunchStartTime;

  // Split activities evenly before and after lunch
  const tableRunsBeforeLunch = Math.ceil(CONFIG.ROUNDS_PER_TEAM / 2);

  // Step 3: Schedule judging sessions
  scheduleJudgingSessions(schedule, morningEndTime);

  // Step 4: Schedule table runs before lunch
  scheduleTableRuns(schedule, 0, tableRunsBeforeLunch, morningEndTime);

  // Step 5: Schedule lunch break
  scheduleLunch(schedule);

  // Step 6: Schedule table runs after lunch
  scheduleTableRuns(
    schedule,
    tableRunsBeforeLunch,
    CONFIG.ROUNDS_PER_TEAM,
    closingStartTime
  );

  // Step 7: Schedule closing ceremony
  scheduleClosingCeremony(schedule);

  // Step 8: Sort events by start time
  schedule.sortByStartTime();

  // Step 9: Evaluate the schedule
  const score = evaluateSimpleSchedule(schedule);
  schedule.score = score;

  return schedule;
}

/**
 * Schedule opening ceremony for all teams
 * @param {Schedule} schedule - The schedule to add events to
 */
function scheduleOpeningCeremony(schedule) {
  // Schedule opening ceremony at the start of the day
  const startTime = CONFIG.DAY_START;

  for (let teamId = 1; teamId <= CONFIG.NUM_TEAMS; teamId++) {
    schedule.addEvent(
      new Event(
        teamId,
        generateTeamName(teamId),
        startTime,
        CONFIG.DURATIONS.OPENING_CEREMONY,
        0, // locationId doesn't matter for ceremonies
        "Main Hall",
        CONFIG.EVENT_TYPES.OPENING_CEREMONY,
        "ceremony"
      )
    );
  }
}

/**
 * Schedule judging sessions for all teams
 * @param {Schedule} schedule - The schedule to add judging sessions to
 * @param {number} blockEndTime - End time for the morning block
 */
function scheduleJudgingSessions(schedule, blockEndTime) {
  // Calculate the number of rooms for each type of judging
  // For odd numbers, allocate one more room to project judging
  const numProjectRooms = Math.ceil(CONFIG.NUM_JUDGING_ROOMS / 2);
  const numRobotRooms = Math.floor(CONFIG.NUM_JUDGING_ROOMS / 2);

  // Start time after opening ceremony
  const startTimeBase =
    CONFIG.DAY_START +
    CONFIG.DURATIONS.OPENING_CEREMONY +
    CONFIG.DURATIONS.JUDGE_BUFFER;

  // Schedule project judging sessions
  for (let i = 0; i < CONFIG.NUM_TEAMS; i++) {
    const teamId = i + 1;
    const roomId = i % numProjectRooms;
    let startTime =
      startTimeBase +
      Math.floor(i / numProjectRooms) *
        (CONFIG.DURATIONS.JUDGING_SESSION + CONFIG.DURATIONS.JUDGE_BUFFER);

    // Check if this would go beyond lunch time
    if (startTime + CONFIG.DURATIONS.JUDGING_SESSION > blockEndTime) {
      // Place after lunch instead
      startTime =
        CONFIG.DAY_START +
        CONFIG.CEREMONIES.LUNCH_START +
        CONFIG.DURATIONS.LUNCH_DURATION +
        CONFIG.DURATIONS.JUDGE_BUFFER +
        (i %
          Math.floor(
            (CONFIG.DAY_END -
              CONFIG.DURATIONS.CLOSING_CEREMONY -
              (CONFIG.DAY_START +
                CONFIG.CEREMONIES.LUNCH_START +
                CONFIG.DURATIONS.LUNCH_DURATION)) /
              (CONFIG.DURATIONS.JUDGING_SESSION + CONFIG.DURATIONS.JUDGE_BUFFER)
          )) *
          (CONFIG.DURATIONS.JUDGING_SESSION + CONFIG.DURATIONS.JUDGE_BUFFER);
    }

    // Create project judging event with proper resource type
    schedule.addEvent(
      new Event(
        teamId,
        generateTeamName(teamId),
        startTime,
        CONFIG.DURATIONS.JUDGING_SESSION,
        roomId,
        `Project Room ${roomId + 1}`,
        CONFIG.EVENT_TYPES.PROJECT_JUDGING,
        "judging"
      )
    );
  }

  // Schedule robot design judging sessions (staggered to avoid conflicts)
  for (let i = 0; i < CONFIG.NUM_TEAMS; i++) {
    const teamId = i + 1;
    const roomId = (i % numRobotRooms) + numProjectRooms; // offset room IDs

    // Offset from project judging slots to avoid team conflicts
    let startTime =
      startTimeBase +
      Math.floor(i / numRobotRooms) *
        (CONFIG.DURATIONS.JUDGING_SESSION + CONFIG.DURATIONS.JUDGE_BUFFER) +
      Math.floor(CONFIG.DURATIONS.JUDGING_SESSION / 2);

    // Check if this would go beyond lunch time
    if (startTime + CONFIG.DURATIONS.JUDGING_SESSION > blockEndTime) {
      // Place after lunch instead
      startTime =
        CONFIG.DAY_START +
        CONFIG.CEREMONIES.LUNCH_START +
        CONFIG.DURATIONS.LUNCH_DURATION +
        CONFIG.DURATIONS.JUDGE_BUFFER +
        Math.floor(CONFIG.DURATIONS.JUDGING_SESSION / 2) +
        (i %
          Math.floor(
            (CONFIG.DAY_END -
              CONFIG.DURATIONS.CLOSING_CEREMONY -
              (CONFIG.DAY_START +
                CONFIG.CEREMONIES.LUNCH_START +
                CONFIG.DURATIONS.LUNCH_DURATION)) /
              (CONFIG.DURATIONS.JUDGING_SESSION + CONFIG.DURATIONS.JUDGE_BUFFER)
          )) *
          (CONFIG.DURATIONS.JUDGING_SESSION + CONFIG.DURATIONS.JUDGE_BUFFER);
    }

    // Check for conflicts with existing team events
    const teamEvents = schedule.getTeamEvents(teamId);
    let hasConflict = true;
    let attempts = 0;
    const maxAttempts = 20;

    while (hasConflict && attempts < maxAttempts) {
      hasConflict = false;
      attempts++;

      for (const existingEvent of teamEvents) {
        // Skip ceremonies when checking conflicts
        if (
          existingEvent.type === CONFIG.EVENT_TYPES.OPENING_CEREMONY ||
          existingEvent.type === CONFIG.EVENT_TYPES.CLOSING_CEREMONY ||
          existingEvent.type === CONFIG.EVENT_TYPES.LUNCH
        ) {
          continue;
        }

        // Check for overlap with buffer
        if (
          startTime <
            existingEvent.getEndTime() + CONFIG.DURATIONS.MIN_TRANSITION_TIME &&
          startTime +
            CONFIG.DURATIONS.JUDGING_SESSION +
            CONFIG.DURATIONS.MIN_TRANSITION_TIME >
            existingEvent.startTime
        ) {
          hasConflict = true;
          startTime =
            existingEvent.getEndTime() + CONFIG.DURATIONS.MIN_TRANSITION_TIME;
          break;
        }
      }

      // Check if we've gone past lunch and need to adjust
      if (
        startTime < blockEndTime &&
        startTime + CONFIG.DURATIONS.JUDGING_SESSION > blockEndTime
      ) {
        startTime =
          CONFIG.DAY_START +
          CONFIG.CEREMONIES.LUNCH_START +
          CONFIG.DURATIONS.LUNCH_DURATION +
          CONFIG.DURATIONS.JUDGE_BUFFER;
        continue;
      }

      // Check if we've gone past day end
      if (
        startTime + CONFIG.DURATIONS.JUDGING_SESSION >
        CONFIG.DAY_END - CONFIG.DURATIONS.CLOSING_CEREMONY
      ) {
        console.warn(
          `Warning: Unable to schedule robot judging for team ${teamId} within day bounds`
        );
        break;
      }
    }

    // Skip if we couldn't resolve conflicts
    if (attempts >= maxAttempts) {
      console.warn(
        `Warning: Unable to schedule robot judging for team ${teamId} after ${maxAttempts} attempts`
      );
      continue;
    }

    // Create robot judging event
    schedule.addEvent(
      new Event(
        teamId,
        generateTeamName(teamId),
        startTime,
        CONFIG.DURATIONS.JUDGING_SESSION,
        roomId,
        `Robot Design Room ${roomId - numProjectRooms + 1}`,
        CONFIG.EVENT_TYPES.ROBOT_JUDGING,
        "judging"
      )
    );
  }
}

/**
 * Schedule lunch break for all teams
 * @param {Schedule} schedule - The schedule to add lunch break to
 */
function scheduleLunch(schedule) {
  const lunchStartTime = CONFIG.DAY_START + CONFIG.CEREMONIES.LUNCH_START;

  // All teams have lunch at the same time
  for (let teamId = 1; teamId <= CONFIG.NUM_TEAMS; teamId++) {
    schedule.addEvent(
      new Event(
        teamId,
        generateTeamName(teamId),
        lunchStartTime,
        CONFIG.DURATIONS.LUNCH_DURATION,
        0, // Location ID doesn't matter for lunch
        "Cafeteria",
        CONFIG.EVENT_TYPES.LUNCH,
        "break"
      )
    );
  }
}

/**
 * Schedule closing ceremony for all teams
 * @param {Schedule} schedule - The schedule to add events to
 */
function scheduleClosingCeremony(schedule) {
  // Schedule closing ceremony at the end of the day
  const startTime = CONFIG.DAY_END - CONFIG.DURATIONS.CLOSING_CEREMONY;

  for (let teamId = 1; teamId <= CONFIG.NUM_TEAMS; teamId++) {
    schedule.addEvent(
      new Event(
        teamId,
        generateTeamName(teamId),
        startTime,
        CONFIG.DURATIONS.CLOSING_CEREMONY,
        0, // locationId doesn't matter for ceremonies
        "Main Hall",
        CONFIG.EVENT_TYPES.CLOSING_CEREMONY,
        "ceremony"
      )
    );
  }
}

/**
 * Schedule table runs for all teams for specified rounds
 * @param {Schedule} schedule - The schedule to add table runs to
 * @param {number} startRound - The first round to schedule (0-indexed)
 * @param {number} endRound - The end round (exclusive)
 * @param {number} blockEndTime - The end time for this block
 */
function scheduleTableRuns(schedule, startRound, endRound, blockEndTime) {
  const blockIsBeforeLunch =
    blockEndTime === CONFIG.DAY_START + CONFIG.CEREMONIES.LUNCH_START;

  // Start time based on which block we're in
  let blockStartTime;
  if (blockIsBeforeLunch) {
    // Morning block - start after opening ceremony
    blockStartTime =
      CONFIG.DAY_START +
      CONFIG.DURATIONS.OPENING_CEREMONY +
      CONFIG.DURATIONS.TABLE_BUFFER;
  } else {
    // Afternoon block - start after lunch
    blockStartTime =
      CONFIG.DAY_START +
      CONFIG.CEREMONIES.LUNCH_START +
      CONFIG.DURATIONS.LUNCH_DURATION +
      CONFIG.DURATIONS.TABLE_BUFFER;
  }

  // Build team schedule to check for conflicts
  const teamSchedule = schedule.buildTeamSchedule();

  // For each round
  for (let round = startRound; round < endRound; round++) {
    // For each team
    for (let teamId = 1; teamId <= CONFIG.NUM_TEAMS; teamId++) {
      const tableId = (teamId - 1 + round) % CONFIG.NUM_ROBOT_TABLES;

      // Calculate a slot based on round and team number
      const slot = (round - startRound) * CONFIG.NUM_TEAMS + teamId - 1;
      let startTime =
        blockStartTime +
        Math.floor(slot / CONFIG.NUM_ROBOT_TABLES) *
          (CONFIG.DURATIONS.TABLE_RUN + CONFIG.DURATIONS.TABLE_BUFFER);

      // Check for conflicts with existing team events
      const teamEvents = teamSchedule[teamId] || [];
      let hasConflict = true;
      let attempts = 0;
      const maxAttempts = 30;

      while (hasConflict && attempts < maxAttempts) {
        hasConflict = false;
        attempts++;

        for (const event of teamEvents) {
          // Skip ceremonies when checking conflicts
          if (
            event.type === CONFIG.EVENT_TYPES.OPENING_CEREMONY ||
            event.type === CONFIG.EVENT_TYPES.CLOSING_CEREMONY ||
            event.type === CONFIG.EVENT_TYPES.LUNCH
          ) {
            continue;
          }

          // Check for time conflicts with buffer
          if (
            startTime <
              event.getEndTime() + CONFIG.DURATIONS.MIN_TRANSITION_TIME &&
            startTime +
              CONFIG.DURATIONS.TABLE_RUN +
              CONFIG.DURATIONS.MIN_TRANSITION_TIME >
              event.startTime
          ) {
            hasConflict = true;
            startTime =
              event.getEndTime() + CONFIG.DURATIONS.MIN_TRANSITION_TIME;
            break;
          }
        }

        // Check if we're going beyond the block end time
        if (startTime + CONFIG.DURATIONS.TABLE_RUN > blockEndTime) {
          console.warn(
            `Warning: Unable to schedule table run for team ${teamId} in round ${
              round + 1
            } within block bounds`
          );
          hasConflict = false; // Exit the loop
          break;
        }
      }

      // Skip if we couldn't resolve conflicts
      if (attempts >= maxAttempts) {
        console.warn(
          `Warning: Unable to schedule table run for team ${teamId} in round ${
            round + 1
          } after ${maxAttempts} attempts`
        );
        continue;
      }

      // Create the table run event
      const tableEvent = new Event(
        teamId,
        generateTeamName(teamId),
        startTime,
        CONFIG.DURATIONS.TABLE_RUN,
        tableId,
        `Table ${tableId + 1}`,
        CONFIG.EVENT_TYPES.TABLE_RUN,
        "table"
      );

      // Add the event to the schedule
      schedule.addEvent(tableEvent);

      // Update the team's events
      teamEvents.push(tableEvent);
      teamSchedule[teamId] = teamEvents;
    }
  }
}

/**
 * Evaluate a schedule and return a simple score
 * @param {Schedule} schedule - The schedule to evaluate
 * @returns {number} A score between 0 and 1
 */
function evaluateSimpleSchedule(schedule) {
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
  const utilizationScore = calculateSimpleUtilizationScore(schedule);
  const flowScore = calculateSimpleFlowScore(schedule);

  // Return a combined score
  return 0.7 * utilizationScore + 0.3 * flowScore;
}

/**
 * Calculate a simple utilization score
 * @param {Schedule} schedule - The schedule to evaluate
 * @returns {number} A score between 0 and 1
 */
function calculateSimpleUtilizationScore(schedule) {
  // Get all judging and table run events
  const activeEvents = schedule
    .getAllEvents()
    .filter(
      (event) =>
        event.type === CONFIG.EVENT_TYPES.TABLE_RUN ||
        event.type === CONFIG.EVENT_TYPES.PROJECT_JUDGING ||
        event.type === CONFIG.EVENT_TYPES.ROBOT_JUDGING
    );

  // Check if any are scheduled
  if (activeEvents.length === 0) {
    return 0.0;
  }

  // Find earliest and latest active event times
  const startTimes = activeEvents.map((e) => e.startTime);
  const endTimes = activeEvents.map((e) => e.getEndTime());

  const earliestStart = Math.min(...startTimes);
  const latestEnd = Math.max(...endTimes);

  // Total span time (excluding ceremonies and lunch)
  const totalSpan = latestEnd - earliestStart - CONFIG.DURATIONS.LUNCH_DURATION;

  // Total event time
  const totalEventTime = activeEvents.reduce(
    (sum, event) => sum + event.duration,
    0
  );

  // Calculate density (total event time / total resources available in span)
  const availableResourceTime =
    totalSpan * (CONFIG.NUM_ROBOT_TABLES + CONFIG.NUM_JUDGING_ROOMS);
  const density = Math.min(1.0, totalEventTime / availableResourceTime);

  return density;
}

/**
 * Calculate a simple flow score
 * @param {Schedule} schedule - The schedule to evaluate
 * @returns {number} A score between 0 and 1
 */
function calculateSimpleFlowScore(schedule) {
  // Check if events are in logical order - opening, activities, lunch, activities, closing
  let score = 0;
  let teamOrderScore = 0;

  for (let teamId = 1; teamId <= CONFIG.NUM_TEAMS; teamId++) {
    const teamEvents = schedule
      .getTeamEvents(teamId)
      .sort((a, b) => a.startTime - b.startTime);

    // Skip teams with incomplete events
    if (teamEvents.length !== CONFIG.ROUNDS_PER_TEAM + 4) continue; // 3 rounds + 2 judging + lunch + opening + closing

    // Check opening is first
    if (teamEvents[0].type === CONFIG.EVENT_TYPES.OPENING_CEREMONY) {
      teamOrderScore += 1;
    }

    // Check closing is last
    if (
      teamEvents[teamEvents.length - 1].type ===
      CONFIG.EVENT_TYPES.CLOSING_CEREMONY
    ) {
      teamOrderScore += 1;
    }

    // Check lunch is in middle
    const lunchIndex = teamEvents.findIndex(
      (e) => e.type === CONFIG.EVENT_TYPES.LUNCH
    );
    const middleIndex = Math.floor(teamEvents.length / 2) - 1;

    if (Math.abs(lunchIndex - middleIndex) <= 1) {
      teamOrderScore += 1;
    }
  }

  score = teamOrderScore / (CONFIG.NUM_TEAMS * 3); // 3 checks per team
  return score;
}

export { generateSimpleSchedule, evaluateSimpleSchedule };
