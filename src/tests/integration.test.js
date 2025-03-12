/**
 * FLL Competition Scheduler - Integration Test
 *
 * This script tests the integration of the FLL Competition Scheduler components.
 */

import CONFIG from "../scheduler/config.js";
import { Schedule, Event } from "../scheduler/models.js";
import { formatTime, generateTeamName } from "../utils/utils.js";

console.log("Testing FLL Competition Scheduler Integration");
console.log("=============================================");

// Create a new schedule
console.log("Creating a new schedule...");
const schedule = new Schedule();

// Test custom parameters
console.log("Testing custom parameters...");
const customNumTeams = 29;
console.log(`Setting number of teams to ${customNumTeams}`);
CONFIG.NUM_TEAMS = customNumTeams;

// Populate the schedule with events
console.log("Populating the schedule with events...");
for (let teamId = 1; teamId <= CONFIG.NUM_TEAMS; teamId++) {
  const teamName = generateTeamName(teamId);

  // Add robot game events
  for (let round = 0; round < CONFIG.ROUNDS_PER_TEAM; round++) {
    const tableId = round % CONFIG.NUM_ROBOT_TABLES;
    const startTime = 60 + round * 15 + (teamId % 5) * 5;

    schedule.addEvent(
      new Event(
        teamId,
        teamName,
        startTime,
        CONFIG.DURATIONS.TABLE_RUN,
        tableId,
        `Table ${tableId + 1}`,
        CONFIG.EVENT_TYPES.TABLE_RUN
      )
    );
  }

  // Add judging events
  const projectRoomId = teamId % (CONFIG.NUM_JUDGING_ROOMS / 2);
  const robotRoomId =
    ((teamId + 2) % (CONFIG.NUM_JUDGING_ROOMS / 2)) +
    CONFIG.NUM_JUDGING_ROOMS / 2;

  schedule.addEvent(
    new Event(
      teamId,
      teamName,
      120 + (teamId % 8) * 30,
      CONFIG.DURATIONS.JUDGING_SESSION,
      projectRoomId,
      `Project Room ${projectRoomId + 1}`,
      CONFIG.EVENT_TYPES.PROJECT_JUDGING
    )
  );

  schedule.addEvent(
    new Event(
      teamId,
      teamName,
      240 + (teamId % 8) * 30,
      CONFIG.DURATIONS.JUDGING_SESSION,
      robotRoomId,
      `Robot Design Room ${robotRoomId - CONFIG.NUM_JUDGING_ROOMS / 2 + 1}`,
      CONFIG.EVENT_TYPES.ROBOT_JUDGING
    )
  );
}

// Build the different views of the schedule
console.log("Building the different views of the schedule...");
const tableSchedule = [];
const judgingSchedule = [];
const teamsSchedule = [];

// Group events by table
for (let tableId = 0; tableId < CONFIG.NUM_ROBOT_TABLES; tableId++) {
  tableSchedule[tableId] = schedule.getLocationEvents(
    tableId,
    CONFIG.EVENT_TYPES.TABLE_RUN
  );
}

// Group events by judging room
for (let roomId = 0; roomId < CONFIG.NUM_JUDGING_ROOMS; roomId++) {
  if (roomId < CONFIG.NUM_JUDGING_ROOMS / 2) {
    judgingSchedule[roomId] = schedule.getLocationEvents(
      roomId,
      CONFIG.EVENT_TYPES.PROJECT_JUDGING
    );
  } else {
    judgingSchedule[roomId] = schedule.getLocationEvents(
      roomId - CONFIG.NUM_JUDGING_ROOMS / 2 + CONFIG.NUM_JUDGING_ROOMS / 2,
      CONFIG.EVENT_TYPES.ROBOT_JUDGING
    );
  }
}

// Group events by team
for (let teamId = 1; teamId <= CONFIG.NUM_TEAMS; teamId++) {
  teamsSchedule[teamId] = schedule.getTeamEvents(teamId);
}

// Print some statistics
console.log("\nSchedule Statistics:");
console.log(`Number of events: ${schedule.getSize()}`);
console.log(`Number of tables: ${CONFIG.NUM_ROBOT_TABLES}`);
console.log(`Number of judging rooms: ${CONFIG.NUM_JUDGING_ROOMS}`);
console.log(`Number of teams: ${CONFIG.NUM_TEAMS}`);

// Print a sample of the schedule
console.log("\nSample of the schedule:");
console.log("Team 1 Schedule:");
if (teamsSchedule[1] && teamsSchedule[1].length > 0) {
  for (const event of teamsSchedule[1]) {
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

    console.log(
      `  ${startTimeStr} - ${endTimeStr}: ${eventTypeStr} at ${event.locationName}`
    );
  }
} else {
  console.log("  No events found for Team 1");
}

console.log("\nIntegration test completed successfully!");
console.log("To test the web application, run:");
console.log("  npm start");
console.log("And navigate to:");
console.log("  http://localhost:8080");
