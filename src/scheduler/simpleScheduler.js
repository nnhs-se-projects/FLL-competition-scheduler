/**
 * FLL Competition Scheduler - Simple Version
 *
 * This file contains a simplified version of the scheduling logic
 * that focuses on just creating a basic valid schedule.
 */

import CONFIG from "./config.js";
import { Event, Schedule } from "./models.js";
import { generateTeamName, generateLocationName } from "./utils.js";

/**
 * Generate a simple but valid FLL competition schedule
 * @returns {Schedule} A valid schedule
 */
function generateSimpleSchedule() {
  const schedule = new Schedule();

  // Create a sequential schedule without randomization
  // This ensures we can create a valid schedule

  // Step 1: Schedule judging sessions
  scheduleJudgingSessions(schedule);

  // Step 2: Schedule table runs
  scheduleTableRuns(schedule);

  // Step 3: Sort events by start time
  schedule.sortByStartTime();

  // Step 4: Evaluate the schedule
  const score = evaluateSimpleSchedule(schedule);
  schedule.score = score;

  return schedule;
}

/**
 * Schedule judging sessions for all teams
 * @param {Schedule} schedule - The schedule to add judging sessions to
 */
function scheduleJudgingSessions(schedule) {
  // Calculate the number of rooms for each type of judging
  // For odd numbers, allocate one more room to project judging
  const numProjectRooms = Math.ceil(CONFIG.NUM_JUDGING_ROOMS / 2);
  const numRobotRooms = Math.floor(CONFIG.NUM_JUDGING_ROOMS / 2);

  // Schedule project judging sessions
  for (let i = 0; i < CONFIG.NUM_TEAMS; i++) {
    const teamId = i + 1;
    const roomId = i % numProjectRooms;
    const startTime =
      Math.floor(i / numProjectRooms) *
      (CONFIG.DURATIONS.JUDGING_SESSION + CONFIG.DURATIONS.JUDGING_BREAK);

    // Adjust for lunch break
    const adjustedStartTime =
      startTime >= CONFIG.TIMING.LUNCH_START_TIME
        ? startTime + CONFIG.DURATIONS.LUNCH_DURATION
        : startTime;

    // Create project judging event
    const projectEvent = new Event(
      teamId,
      generateTeamName(teamId),
      adjustedStartTime,
      CONFIG.DURATIONS.JUDGING_SESSION,
      roomId,
      generateLocationName(roomId, CONFIG.EVENT_TYPES.PROJECT_JUDGING),
      CONFIG.EVENT_TYPES.PROJECT_JUDGING
    );

    schedule.addEvent(projectEvent);
  }

  // Schedule robot judging sessions
  for (let i = 0; i < CONFIG.NUM_TEAMS; i++) {
    const teamId = i + 1;
    const roomId = (i % numRobotRooms) + numProjectRooms;
    const startTime =
      Math.floor(i / numRobotRooms) *
        (CONFIG.DURATIONS.JUDGING_SESSION + CONFIG.DURATIONS.JUDGING_BREAK) +
      CONFIG.DURATIONS.JUDGING_SESSION +
      30; // Add 30 minutes buffer

    // Adjust for lunch break
    const adjustedStartTime =
      startTime >= CONFIG.TIMING.LUNCH_START_TIME
        ? startTime + CONFIG.DURATIONS.LUNCH_DURATION
        : startTime;

    // Create robot judging event
    const robotEvent = new Event(
      teamId,
      generateTeamName(teamId),
      adjustedStartTime,
      CONFIG.DURATIONS.JUDGING_SESSION,
      roomId,
      generateLocationName(roomId, CONFIG.EVENT_TYPES.ROBOT_JUDGING),
      CONFIG.EVENT_TYPES.ROBOT_JUDGING
    );

    schedule.addEvent(robotEvent);
  }
}

/**
 * Schedule table runs for all teams
 * @param {Schedule} schedule - The schedule to add table runs to
 */
function scheduleTableRuns(schedule) {
  // Get the judging events for each team
  const teamSchedule = schedule.buildTeamSchedule();

  // Schedule table runs
  for (let round = 0; round < CONFIG.ROUNDS_PER_TEAM; round++) {
    for (let i = 0; i < CONFIG.NUM_TEAMS; i++) {
      const teamId = i + 1;
      const tableId = i % CONFIG.NUM_ROBOT_TABLES;

      // Calculate start time based on round and team
      let startTime =
        200 + // Start table runs after judging sessions
        round *
          (CONFIG.NUM_TEAMS / CONFIG.NUM_ROBOT_TABLES) *
          CONFIG.DURATIONS.TABLE_RUN +
        Math.floor(i / CONFIG.NUM_ROBOT_TABLES) * CONFIG.DURATIONS.TABLE_RUN;

      // Apply table offset based on table ID
      startTime += CONFIG.TIMING.TABLE_OFFSETS[tableId] || 0;

      // Get the team's existing events
      const teamEvents = teamSchedule[teamId] || [];

      // Check for conflicts with existing events
      let hasConflict = true;
      while (hasConflict) {
        hasConflict = false;

        for (const event of teamEvents) {
          // Check if the table run would overlap with another event
          // Add a 15-minute buffer between events
          if (
            startTime < event.startTime + event.duration + 15 &&
            startTime + CONFIG.DURATIONS.TABLE_RUN + 15 > event.startTime
          ) {
            hasConflict = true;
            startTime = event.startTime + event.duration + 15;
            break;
          }
        }
      }

      // Create the table run event
      const tableEvent = new Event(
        teamId,
        generateTeamName(teamId),
        startTime,
        CONFIG.DURATIONS.TABLE_RUN,
        tableId,
        generateLocationName(tableId, CONFIG.EVENT_TYPES.TABLE_RUN),
        CONFIG.EVENT_TYPES.TABLE_RUN
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
  // Build the different views of the schedule
  const teamSchedule = schedule.buildTeamSchedule();
  const tableSchedule = schedule.buildTableSchedule();
  const judgingSchedule = schedule.buildJudgingSchedule();

  // Check that each team has the correct number of events
  for (const teamId in teamSchedule) {
    const teamEvents = teamSchedule[teamId];

    // Count the different types of events
    let tableRunCount = 0;
    let projectJudgingCount = 0;
    let robotJudgingCount = 0;

    for (const event of teamEvents) {
      if (event.type === CONFIG.EVENT_TYPES.TABLE_RUN) {
        tableRunCount++;
      } else if (event.type === CONFIG.EVENT_TYPES.PROJECT_JUDGING) {
        projectJudgingCount++;
      } else if (event.type === CONFIG.EVENT_TYPES.ROBOT_JUDGING) {
        robotJudgingCount++;
      }
    }

    // Check that the counts are correct
    if (
      tableRunCount !== CONFIG.ROUNDS_PER_TEAM ||
      projectJudgingCount !== 1 ||
      robotJudgingCount !== 1
    ) {
      return 0.0; // Invalid schedule
    }

    // Check for overlapping team events
    teamEvents.sort((a, b) => a.startTime - b.startTime);

    for (let i = 0; i < teamEvents.length - 1; i++) {
      // Add a 10-minute buffer between events
      if (teamEvents[i].getEndTime() + 10 > teamEvents[i + 1].startTime) {
        return 0.0; // Invalid schedule
      }
    }
  }

  // Check for overlapping table events
  for (const tableId in tableSchedule) {
    const tableEvents = tableSchedule[tableId];
    tableEvents.sort((a, b) => a.startTime - b.startTime);

    for (let i = 0; i < tableEvents.length - 1; i++) {
      if (tableEvents[i].getEndTime() > tableEvents[i + 1].startTime) {
        return 0.0; // Invalid schedule
      }
    }
  }

  // Check for overlapping judging events
  for (const roomId in judgingSchedule) {
    const roomEvents = judgingSchedule[roomId];
    roomEvents.sort((a, b) => a.startTime - b.startTime);

    for (let i = 0; i < roomEvents.length - 1; i++) {
      if (
        roomEvents[i].getEndTime() + CONFIG.DURATIONS.JUDGING_BREAK >
        roomEvents[i + 1].startTime
      ) {
        return 0.0; // Invalid schedule
      }
    }
  }

  // If we get here, the schedule is valid
  return 0.8; // Give it a reasonable score
}

export { generateSimpleSchedule };
