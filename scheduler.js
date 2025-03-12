/**
 * FLL Competition Scheduler
 *
 * This file contains the core scheduling logic for generating valid FLL competition schedules.
 */

import CONFIG from "./config.js";
import { Event, Schedule } from "./models.js";
import {
  randRange,
  shuffleArray,
  overlapsWithLunch,
  adjustForLunch,
  generateTeamName,
  generateLocationName,
} from "./utils.js";

/**
 * Generate a random but valid FLL competition schedule
 * @returns {Schedule} A valid schedule
 */
function generateSchedule() {
  let schedule = null;
  let attempts = 0;
  const maxAttempts = 500;

  while (!schedule && attempts < maxAttempts) {
    attempts++;
    try {
      schedule = createRandomSchedule();

      // Validate and score the schedule
      const score = evaluateSchedule(schedule);

      // If the schedule is invalid, try again
      if (score <= 0) {
        if (attempts % 50 === 0) {
          console.log(`Attempt ${attempts}/${maxAttempts} failed. Retrying...`);
        }
        schedule = null;
      } else {
        console.log(`Valid schedule found after ${attempts} attempts.`);
        schedule.score = score;
      }
    } catch (error) {
      console.error(`Error in attempt ${attempts}:`, error.message);
      schedule = null;
    }
  }

  if (!schedule) {
    throw new Error(
      `Failed to generate a valid schedule after ${maxAttempts} attempts`
    );
  }

  return schedule;
}

/**
 * Create a random schedule using constraint-based generation
 * @returns {Schedule} A randomly generated schedule
 */
function createRandomSchedule() {
  const schedule = new Schedule();

  // Step 1: Generate judging sessions
  generateJudgingSessions(schedule);

  // Step 2: Generate table runs
  generateTableRuns(schedule);

  // Step 3: Sort events by start time
  schedule.sortByStartTime();

  return schedule;
}

/**
 * Generate judging sessions for all teams
 * @param {Schedule} schedule - The schedule to add judging sessions to
 */
function generateJudgingSessions(schedule) {
  // Create arrays to track the current time for each judging room
  const projectRoomTimes = Array(CONFIG.NUM_JUDGING_ROOMS / 2).fill(0);
  const robotRoomTimes = Array(CONFIG.NUM_JUDGING_ROOMS / 2).fill(0);

  // Apply the initial time offsets
  for (let i = 0; i < projectRoomTimes.length; i++) {
    projectRoomTimes[i] = CONFIG.TIMING.JUDGING_OFFSETS[i];
    robotRoomTimes[i] =
      CONFIG.TIMING.JUDGING_OFFSETS[i + projectRoomTimes.length];
  }

  // Create a shuffled list of teams
  const teams = Array.from({ length: CONFIG.NUM_TEAMS }, (_, i) => i + 1);
  const shuffledTeams = shuffleArray(teams);

  // Assign each team to one project judging session and one robot judging session
  for (const teamId of shuffledTeams) {
    // Find the project judging room with the earliest available time
    const projectRoomIndex = projectRoomTimes.indexOf(
      Math.min(...projectRoomTimes)
    );
    let projectStartTime = projectRoomTimes[projectRoomIndex];

    // Check if the time overlaps with lunch and adjust if needed
    if (
      overlapsWithLunch(
        projectStartTime,
        CONFIG.DURATIONS.JUDGING_SESSION,
        CONFIG.TIMING.LUNCH_START_TIME,
        CONFIG.DURATIONS.LUNCH_DURATION
      )
    ) {
      projectStartTime =
        CONFIG.TIMING.LUNCH_START_TIME + CONFIG.DURATIONS.LUNCH_DURATION;
    }

    // Create the project judging event
    const projectEvent = new Event(
      teamId,
      generateTeamName(teamId),
      projectStartTime,
      CONFIG.DURATIONS.JUDGING_SESSION,
      projectRoomIndex,
      generateLocationName(
        projectRoomIndex,
        CONFIG.EVENT_TYPES.PROJECT_JUDGING
      ),
      CONFIG.EVENT_TYPES.PROJECT_JUDGING
    );

    // Add the event to the schedule
    schedule.addEvent(projectEvent);

    // Update the project room time
    projectRoomTimes[projectRoomIndex] =
      projectStartTime +
      CONFIG.DURATIONS.JUDGING_SESSION +
      CONFIG.DURATIONS.JUDGING_BREAK;

    // Find the robot judging room with the earliest available time
    const robotRoomIndex = robotRoomTimes.indexOf(Math.min(...robotRoomTimes));
    let robotStartTime = robotRoomTimes[robotRoomIndex];

    // Check if the time overlaps with lunch and adjust if needed
    if (
      overlapsWithLunch(
        robotStartTime,
        CONFIG.DURATIONS.JUDGING_SESSION,
        CONFIG.TIMING.LUNCH_START_TIME,
        CONFIG.DURATIONS.LUNCH_DURATION
      )
    ) {
      robotStartTime =
        CONFIG.TIMING.LUNCH_START_TIME + CONFIG.DURATIONS.LUNCH_DURATION;
    }

    // Create the robot judging event
    const robotEvent = new Event(
      teamId,
      generateTeamName(teamId),
      robotStartTime,
      CONFIG.DURATIONS.JUDGING_SESSION,
      robotRoomIndex,
      generateLocationName(robotRoomIndex, CONFIG.EVENT_TYPES.ROBOT_JUDGING),
      CONFIG.EVENT_TYPES.ROBOT_JUDGING
    );

    // Add the event to the schedule
    schedule.addEvent(robotEvent);

    // Update the robot room time
    robotRoomTimes[robotRoomIndex] =
      robotStartTime +
      CONFIG.DURATIONS.JUDGING_SESSION +
      CONFIG.DURATIONS.JUDGING_BREAK;
  }
}

/**
 * Generate table runs for all teams
 * @param {Schedule} schedule - The schedule to add table runs to
 */
function generateTableRuns(schedule) {
  // Create arrays to track the current time for each table
  const tableTimes = Array(CONFIG.NUM_ROBOT_TABLES).fill(0);

  // Apply the initial time offsets
  for (let i = 0; i < tableTimes.length; i++) {
    tableTimes[i] = CONFIG.TIMING.TABLE_OFFSETS[i];
  }

  // Get the judging events for each team
  const teamSchedule = schedule.buildTeamSchedule();

  // Create a list of teams
  const teams = Array.from({ length: CONFIG.NUM_TEAMS }, (_, i) => i + 1);

  // For each round, assign teams to tables
  for (let round = 0; round < CONFIG.ROUNDS_PER_TEAM; round++) {
    // Shuffle the teams for this round
    const shuffledTeams = shuffleArray(teams);

    // Assign each team to a table
    for (const teamId of shuffledTeams) {
      // Get the team's judging events
      const teamEvents = teamSchedule[teamId] || [];

      // Find the table with the earliest available time
      const tableIndex = tableTimes.indexOf(Math.min(...tableTimes));
      let startTime = tableTimes[tableIndex];

      // Check if the time overlaps with lunch and adjust if needed
      if (
        overlapsWithLunch(
          startTime,
          CONFIG.DURATIONS.TABLE_RUN,
          CONFIG.TIMING.LUNCH_START_TIME,
          CONFIG.DURATIONS.LUNCH_DURATION
        )
      ) {
        startTime =
          CONFIG.TIMING.LUNCH_START_TIME + CONFIG.DURATIONS.LUNCH_DURATION;
      }

      // Check for conflicts with the team's judging events
      let hasConflict = false;
      const maxAttempts = 100;
      let attempts = 0;

      while (attempts < maxAttempts) {
        hasConflict = false;

        for (const event of teamEvents) {
          // Check if the table run would overlap with a judging event
          // Add a 10-minute buffer between events
          if (
            startTime < event.startTime + event.duration + 10 &&
            startTime + CONFIG.DURATIONS.TABLE_RUN + 10 > event.startTime
          ) {
            hasConflict = true;
            break;
          }
        }

        if (!hasConflict) {
          break;
        }

        // Try the next available time slot
        startTime += 5;

        // Check if the time overlaps with lunch and adjust if needed
        if (
          overlapsWithLunch(
            startTime,
            CONFIG.DURATIONS.TABLE_RUN,
            CONFIG.TIMING.LUNCH_START_TIME,
            CONFIG.DURATIONS.LUNCH_DURATION
          )
        ) {
          startTime =
            CONFIG.TIMING.LUNCH_START_TIME + CONFIG.DURATIONS.LUNCH_DURATION;
        }

        attempts++;
      }

      if (hasConflict) {
        // If we couldn't find a non-conflicting time, try a different table
        continue;
      }

      // Create the table run event
      const tableEvent = new Event(
        teamId,
        generateTeamName(teamId),
        startTime,
        CONFIG.DURATIONS.TABLE_RUN,
        tableIndex,
        generateLocationName(tableIndex, CONFIG.EVENT_TYPES.TABLE_RUN),
        CONFIG.EVENT_TYPES.TABLE_RUN
      );

      // Add the event to the schedule
      schedule.addEvent(tableEvent);

      // Update the team's events
      teamEvents.push(tableEvent);
      teamSchedule[teamId] = teamEvents;

      // Update the table time
      tableTimes[tableIndex] = startTime + CONFIG.DURATIONS.TABLE_RUN;
    }
  }
}

/**
 * Evaluate a schedule and return a score
 * @param {Schedule} schedule - The schedule to evaluate
 * @returns {number} A score between 0 and 1, where 0 is invalid and 1 is perfect
 */
function evaluateSchedule(schedule) {
  // Build the different views of the schedule
  const teamSchedule = schedule.buildTeamSchedule();
  const tableSchedule = schedule.buildTableSchedule();
  const judgingSchedule = schedule.buildJudgingSchedule();

  // Check for overlapping events at tables
  for (const tableId in tableSchedule) {
    const tableEvents = tableSchedule[tableId];

    for (let i = 0; i < tableEvents.length - 1; i++) {
      if (tableEvents[i].getEndTime() > tableEvents[i + 1].startTime) {
        return 0.0; // Invalid schedule
      }
    }
  }

  // Check for overlapping events in judging rooms
  for (const roomId in judgingSchedule) {
    const roomEvents = judgingSchedule[roomId];

    for (let i = 0; i < roomEvents.length - 1; i++) {
      if (
        roomEvents[i].getEndTime() + CONFIG.DURATIONS.JUDGING_BREAK >
        roomEvents[i + 1].startTime
      ) {
        return 0.0; // Invalid schedule
      }
    }
  }

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

  // Calculate a score based on the time between a team's events
  // We want to optimize for a reasonable time between events (not too short, not too long)
  // Ideal time between events is around 30-60 minutes
  let score = 0.0;
  const idealGapMin = 30;
  const idealGapMax = 60;

  for (const teamId in teamSchedule) {
    const teamEvents = teamSchedule[teamId];
    teamEvents.sort((a, b) => a.startTime - b.startTime);

    for (let i = 0; i < teamEvents.length - 1; i++) {
      const gap = teamEvents[i + 1].startTime - teamEvents[i].getEndTime();

      // Score the gap (0.0 to 1.0)
      let gapScore = 0.0;

      if (gap < idealGapMin) {
        // Too short: linear score from 0.0 to 1.0
        gapScore = gap / idealGapMin;
      } else if (gap <= idealGapMax) {
        // Ideal: full score
        gapScore = 1.0;
      } else {
        // Too long: decreasing score
        gapScore = Math.max(0.0, 1.0 - (gap - idealGapMax) / 60);
      }

      score += gapScore;
    }
  }

  // Normalize the score
  const maxPossibleScore = CONFIG.NUM_TEAMS * (CONFIG.ROUNDS_PER_TEAM + 2 - 1);
  return score / maxPossibleScore;
}

export { generateSchedule, createRandomSchedule, evaluateSchedule };
