/**
 * FLL Competition Scheduler - Visualizer
 *
 * This file contains functions for visualizing FLL competition schedules.
 */

import CONFIG from "./config.js";
import { formatTime } from "./utils.js";

/**
 * Generate a text representation of a schedule
 * @param {Schedule} schedule - The schedule to visualize
 * @returns {string} A text representation of the schedule
 */
function visualizeSchedule(schedule) {
  let output = "FLL COMPETITION SCHEDULE\n";
  output += "=======================\n\n";

  // Add schedule summary
  output += `Number of Teams: ${CONFIG.NUM_TEAMS}\n`;
  output += `Number of Robot Tables: ${CONFIG.NUM_ROBOT_TABLES}\n`;
  output += `Number of Judging Rooms: ${CONFIG.NUM_JUDGING_ROOMS}\n`;
  output += `Schedule Score: ${schedule.score.toFixed(4)}\n\n`;

  // Add team schedules
  output += visualizeTeamSchedules(schedule);

  // Add table schedules
  output += visualizeTableSchedules(schedule);

  // Add judging room schedules
  output += visualizeJudgingSchedules(schedule);

  return output;
}

/**
 * Generate a text representation of team schedules
 * @param {Schedule} schedule - The schedule to visualize
 * @returns {string} A text representation of team schedules
 */
function visualizeTeamSchedules(schedule) {
  const teamSchedule = schedule.buildTeamSchedule();
  let output = "TEAM SCHEDULES\n";
  output += "=============\n\n";

  for (let i = 1; i <= CONFIG.NUM_TEAMS; i++) {
    const teamEvents = teamSchedule[i] || [];
    teamEvents.sort((a, b) => a.startTime - b.startTime);

    output += `Team ${i}:\n`;

    for (const event of teamEvents) {
      const startTimeStr = formatTime(event.startTime);
      const endTimeStr = formatTime(event.startTime + event.duration);

      let eventTypeStr = "";
      if (event.type === CONFIG.EVENT_TYPES.TABLE_RUN) {
        eventTypeStr = "Robot Game";
      } else if (event.type === CONFIG.EVENT_TYPES.PROJECT_JUDGING) {
        eventTypeStr = "Project Judging";
      } else if (event.type === CONFIG.EVENT_TYPES.ROBOT_JUDGING) {
        eventTypeStr = "Robot Design Judging";
      }

      output += `  ${startTimeStr} - ${endTimeStr}: ${eventTypeStr} at ${event.locationName}\n`;
    }

    output += "\n";
  }

  return output;
}

/**
 * Generate a text representation of table schedules
 * @param {Schedule} schedule - The schedule to visualize
 * @returns {string} A text representation of table schedules
 */
function visualizeTableSchedules(schedule) {
  const tableSchedule = schedule.buildTableSchedule();
  let output = "TABLE SCHEDULES\n";
  output += "==============\n\n";

  for (let i = 0; i < CONFIG.NUM_ROBOT_TABLES; i++) {
    const tableEvents = tableSchedule[i] || [];
    tableEvents.sort((a, b) => a.startTime - b.startTime);

    output += `Table ${i + 1}:\n`;

    for (const event of tableEvents) {
      const startTimeStr = formatTime(event.startTime);
      const endTimeStr = formatTime(event.startTime + event.duration);

      output += `  ${startTimeStr} - ${endTimeStr}: Team ${event.teamId}\n`;
    }

    output += "\n";
  }

  return output;
}

/**
 * Generate a text representation of judging room schedules
 * @param {Schedule} schedule - The schedule to visualize
 * @returns {string} A text representation of judging room schedules
 */
function visualizeJudgingSchedules(schedule) {
  const judgingSchedule = schedule.buildJudgingSchedule();
  let output = "JUDGING ROOM SCHEDULES\n";
  output += "=====================\n\n";

  for (let i = 0; i < CONFIG.NUM_JUDGING_ROOMS; i++) {
    const roomEvents = judgingSchedule[i] || [];
    roomEvents.sort((a, b) => a.startTime - b.startTime);

    let roomType = "";
    if (i < CONFIG.NUM_JUDGING_ROOMS / 2) {
      roomType = "Project Judging";
    } else {
      roomType = "Robot Design Judging";
    }

    output += `${roomType} Room ${(i % (CONFIG.NUM_JUDGING_ROOMS / 2)) + 1}:\n`;

    for (const event of roomEvents) {
      const startTimeStr = formatTime(event.startTime);
      const endTimeStr = formatTime(event.startTime + event.duration);

      output += `  ${startTimeStr} - ${endTimeStr}: Team ${event.teamId}\n`;
    }

    output += "\n";
  }

  return output;
}

/**
 * Generate a JSON representation of a schedule
 * @param {Schedule} schedule - The schedule to convert to JSON
 * @returns {Object} A JSON representation of the schedule
 */
function scheduleToJson(schedule) {
  const teamSchedule = schedule.buildTeamSchedule();
  const result = {
    metadata: {
      numTeams: CONFIG.NUM_TEAMS,
      numRobotTables: CONFIG.NUM_ROBOT_TABLES,
      numJudgingRooms: CONFIG.NUM_JUDGING_ROOMS,
      score: schedule.score,
    },
    teams: {},
  };

  for (let i = 1; i <= CONFIG.NUM_TEAMS; i++) {
    const teamEvents = teamSchedule[i] || [];
    teamEvents.sort((a, b) => a.startTime - b.startTime);

    result.teams[`Team ${i}`] = teamEvents.map((event) => ({
      eventType: event.type,
      startTime: event.startTime,
      duration: event.duration,
      endTime: event.startTime + event.duration,
      location: event.locationName,
    }));
  }

  return result;
}

export {
  visualizeSchedule,
  visualizeTeamSchedules,
  visualizeTableSchedules,
  visualizeJudgingSchedules,
  scheduleToJson,
};
