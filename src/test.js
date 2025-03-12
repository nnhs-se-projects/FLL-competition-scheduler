/**
 * FLL Competition Scheduler - Test Script
 *
 * This script tests the integration of the scheduler with the web application.
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { FLLSchedule } = require("./web/scheduleAdapter.cjs");

console.log("Testing FLL Competition Scheduler");
console.log("=================================");

// Create a new schedule
console.log("Creating a new schedule...");
const schedule = new FLLSchedule();

// Test custom parameters
console.log("Testing custom parameters...");
const customNumTeams = 29;
console.log(`Setting number of teams to ${customNumTeams}`);
schedule.setNumTeams(customNumTeams);

// Populate the schedule with random genes
console.log("Populating the schedule with random genes...");
schedule.populateWithRandomGenes();

// Build the different views of the schedule
console.log("Building the different views of the schedule...");
const tableSchedule = schedule.buildTableSchedule();
const judgingSchedule = schedule.buildJudgingSchedule();
const teamsSchedule = schedule.buildTeamsSchedule();

// Print some statistics
console.log("\nSchedule Statistics:");
console.log(`Number of events: ${schedule.genes.length}`);
console.log(`Number of tables: ${tableSchedule.length}`);
console.log(`Number of judging rooms: ${judgingSchedule.length}`);
console.log(`Number of teams: ${teamsSchedule.length - 1}`);

// Print a sample of the schedule
console.log("\nSample of the schedule:");
console.log("Team 1 Schedule:");
if (teamsSchedule[1] && teamsSchedule[1].length > 0) {
  for (const event of teamsSchedule[1]) {
    const startHour = Math.floor(event.startTime / 60);
    const startMinute = event.startTime % 60;
    const endHour = Math.floor((event.startTime + event.duration) / 60);
    const endMinute = (event.startTime + event.duration) % 60;

    const startTimeStr = `${startHour.toString().padStart(2, "0")}:${startMinute
      .toString()
      .padStart(2, "0")}`;
    const endTimeStr = `${endHour.toString().padStart(2, "0")}:${endMinute
      .toString()
      .padStart(2, "0")}`;

    let eventTypeStr = "";
    if (event.type === "tableRun") {
      eventTypeStr = "Robot Game";
    } else if (event.type === "projectJudging") {
      eventTypeStr = "Project Judging";
    } else if (event.type === "robotJudging") {
      eventTypeStr = "Robot Design Judging";
    }

    console.log(
      `  ${startTimeStr} - ${endTimeStr}: ${eventTypeStr} at ${event.locationName}`
    );
  }
} else {
  console.log("  No events found for Team 1");
}

console.log("\nTest completed successfully!");
console.log("To start the web application, run:");
console.log("  npm start");
console.log("And navigate to:");
console.log("  http://localhost:8080");
