/**
 * FLL Competition Scheduler - Visualizer
 *
 * This file contains utility functions for visualizing FLL competition schedules.
 */

import CONFIG from "../scheduler/config.js";
import { formatTime, formatTimeAMPM } from "./utils.js";

/**
 * Visualize the schedule
 * @param {Object} schedule - The schedule to visualize
 * @returns {String} The formatted schedule
 */
export function visualizeSchedule(schedule) {
  let output = "FLL COMPETITION SCHEDULE\n=======================\n\n";

  output += visualizeJudgingSchedules(schedule.judgingSchedule);
  output += "\n";
  output += visualizeTableSchedules(schedule.tableRuns);
  output += "\n";
  output += visualizeTeamSchedules(schedule.teamsSchedule);

  return output;
}

/**
 * Visualize the judging schedules
 * @param {Array} judgingSchedule - The judging schedule
 * @returns {String} The formatted judging schedule
 */
export function visualizeJudgingSchedules(judgingSchedule) {
  if (!judgingSchedule || judgingSchedule.length === 0) {
    return "No judging schedule available.";
  }

  let output = "JUDGING SCHEDULE\n===============\n\n";

  // Calculate the number of project and robot judging rooms
  const numProjectRooms = Math.ceil(judgingSchedule.length / 2);
  const numRobotRooms = Math.floor(judgingSchedule.length / 2);

  // Project Judging
  output += "Project Judging:\n";
  output += "-----------------\n\n";

  for (let i = 0; i < numProjectRooms; i++) {
    const roomEvents = judgingSchedule[i] || [];
    output += `Room ${i + 1}:\n`;

    if (roomEvents.length === 0) {
      output += "  No events scheduled\n\n";
      continue;
    }

    for (const event of roomEvents) {
      const startTime = CONFIG.TIMING.START_TIME + event.startTime;
      const endTime = startTime + event.duration;

      output += `  ${formatTimeAMPM(startTime)} - ${formatTimeAMPM(
        endTime
      )}: Team ${event.teamID}\n`;
    }
    output += "\n";
  }

  // Robot Design Judging
  output += "Robot Design Judging:\n";
  output += "-----------------\n\n";

  for (let i = 0; i < numRobotRooms; i++) {
    const roomIndex = i + numProjectRooms;
    const roomEvents = judgingSchedule[roomIndex] || [];
    output += `Room ${i + 1}:\n`;

    if (roomEvents.length === 0) {
      output += "  No events scheduled\n\n";
      continue;
    }

    for (const event of roomEvents) {
      const startTime = CONFIG.TIMING.START_TIME + event.startTime;
      const endTime = startTime + event.duration;

      output += `  ${formatTimeAMPM(startTime)} - ${formatTimeAMPM(
        endTime
      )}: Team ${event.teamID}\n`;
    }
    output += "\n";
  }

  return output;
}

/**
 * Visualize the table schedules
 * @param {Array} tableSchedule - The table schedule
 * @returns {String} The formatted table schedule
 */
export function visualizeTableSchedules(tableSchedule) {
  if (!tableSchedule || tableSchedule.length === 0) {
    return "No table schedule available.";
  }

  let output = "TABLE SCHEDULE\n==============\n\n";

  for (let i = 0; i < tableSchedule.length; i++) {
    const tableEvents = tableSchedule[i] || [];
    output += `Table ${i + 1}:\n`;

    if (tableEvents.length === 0) {
      output += "  No events scheduled\n\n";
      continue;
    }

    for (const event of tableEvents) {
      const startTime = CONFIG.TIMING.START_TIME + event.startTime;
      const endTime = startTime + event.duration;

      output += `  ${formatTimeAMPM(startTime)} - ${formatTimeAMPM(
        endTime
      )}: Team ${event.teamID}\n`;
    }
    output += "\n";
  }

  return output;
}

/**
 * Visualize the team schedules
 * @param {Array} teamSchedule - The team schedule
 * @returns {String} The formatted team schedule
 */
export function visualizeTeamSchedules(teamSchedule) {
  if (!teamSchedule || teamSchedule.length === 0) {
    return "No team schedule available.";
  }

  let output = "TEAM SCHEDULE\n=============\n\n";

  for (let i = 1; i < teamSchedule.length; i++) {
    const teamEvents = teamSchedule[i] || [];
    output += `Team ${i}:\n`;

    if (teamEvents.length === 0) {
      output += "  No events scheduled\n\n";
      continue;
    }

    // Sort events by start time
    teamEvents.sort((a, b) => a.startTime - b.startTime);

    for (const event of teamEvents) {
      const startTime = CONFIG.TIMING.START_TIME + event.startTime;
      const endTime = startTime + event.duration;
      let eventType = "Unknown";

      if (event.type === "tableRun") {
        eventType = "Robot Game";
      } else if (event.type === "projectJudging") {
        eventType = "Project Judging";
      } else if (event.type === "robotJudging") {
        eventType = "Robot Design Judging";
      }

      output += `  ${formatTimeAMPM(startTime)} - ${formatTimeAMPM(
        endTime
      )}: ${eventType} at ${event.locationName}\n`;
    }
    output += "\n";
  }

  return output;
}

/**
 * Convert a schedule to JSON
 * @param {Object} schedule - The schedule to convert
 * @returns {String} The JSON string
 */
export function scheduleToJson(schedule) {
  return JSON.stringify(schedule, null, 2);
}

/**
 * Convert a schedule to CSV
 * @param {Object} schedule - The schedule to convert
 * @returns {String} The CSV string
 */
export function scheduleToCsv(schedule) {
  let csv = "Team ID,Team Name,Event Type,Start Time,End Time,Location\n";

  for (let i = 1; i < schedule.teamsSchedule.length; i++) {
    const teamEvents = schedule.teamsSchedule[i] || [];

    for (const event of teamEvents) {
      const startTime = CONFIG.TIMING.START_TIME + event.startTime;
      const endTime = startTime + event.duration;
      let eventType = "Unknown";

      if (event.type === "tableRun") {
        eventType = "Robot Game";
      } else if (event.type === "projectJudging") {
        eventType = "Project Judging";
      } else if (event.type === "robotJudging") {
        eventType = "Robot Design Judging";
      }

      csv += `${event.teamID},${event.teamName},${eventType},${formatTimeAMPM(
        startTime
      )},${formatTimeAMPM(endTime)},${event.locationName}\n`;
    }
  }

  return csv;
}
