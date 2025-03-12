/**
 * FLL Competition Scheduler - Adapter
 *
 * This file adapts the new scheduling algorithm to work with the existing website.
 */

// Import the new scheduling modules
import { generateSimpleSchedule } from "../simpleScheduler.js";
import { optimizeSchedule } from "../geneticAlgorithm.js";
import { Event } from "../models.js";
import CONFIG from "../config.js";

// Constants to match the existing system
const TABLE_RUN_TYPE = "tableRun";
const PROJECT_JUDGING_TYPE = "projectJudging";
const ROBOT_JUDGING_TYPE = "robotJudging";

/**
 * Generate a schedule using the new algorithm and convert it to the format expected by the website
 * @returns {Object} The schedule in the format expected by the website
 */
export function generateNewSchedule() {
  try {
    // Generate a schedule using the new algorithm
    const initialSchedule = generateSimpleSchedule();

    // Optimize the schedule
    const optimizedSchedule = optimizeSchedule(initialSchedule);

    // Convert the schedule to the format expected by the FLLSchedule class
    const fllSchedule = new FLLSchedule();

    // Add events from the optimized schedule
    for (const event of optimizedSchedule.events) {
      fllSchedule.genes.push(
        new FLLEvent(
          event.teamId,
          `Team ${event.teamId}`,
          event.startTime,
          event.duration,
          event.locationId,
          event.locationName,
          event.type
        )
      );
    }

    // Sort events by start time
    fllSchedule.genes.sort((a, b) => a.startTime - b.startTime);

    // Update the score
    fllSchedule.score = optimizedSchedule.score;

    return fllSchedule;
  } catch (error) {
    console.error("Error generating schedule:", error);

    // Fallback to the existing algorithm if there's an error
    const fllSchedule = new FLLSchedule();
    fllSchedule.populateWithRandomGenes();
    return fllSchedule;
  }
}

/**
 * FLLSchedule class that matches the interface expected by the website
 */
class FLLSchedule {
  constructor() {
    this.genes = [];
    this.score = 0;
    this.mutationProbability = 0.1;
    this.numberOfPotentialMutations = 5;
  }

  /**
   * Populate the schedule with random genes using the existing algorithm
   * This is kept as a fallback in case the new algorithm fails
   */
  populateWithRandomGenes() {
    try {
      // Try to use the new algorithm first
      const newSchedule = generateNewSchedule();
      this.genes = newSchedule.genes;
      this.score = newSchedule.score;
    } catch (error) {
      console.error(
        "Error using new algorithm, falling back to original:",
        error
      );

      // If that fails, use the original implementation
      const { createFullSchedule } = require("../fullRandomSchedule.js");

      const schedule = createFullSchedule();
      const tableSchedule = schedule[0];
      const judgingSchedule = schedule[1];

      for (let i = 0; i < tableSchedule.length; i++) {
        for (let j = 0; j < tableSchedule[i].length; j++) {
          this.genes.push(
            new FLLEvent(
              tableSchedule[i][j].id,
              tableSchedule[i][j].name,
              tableSchedule[i][j].start,
              tableSchedule[i][j].duration,
              i,
              "table " + i,
              TABLE_RUN_TYPE
            )
          );
        }
      }

      for (let i = 0; i < judgingSchedule.length; i++) {
        for (let j = 0; j < judgingSchedule[i].length; j++) {
          this.genes.push(
            new FLLEvent(
              judgingSchedule[i][j].id,
              judgingSchedule[i][j].name,
              judgingSchedule[i][j].startT,
              judgingSchedule[i][j].duration,
              i,
              "judging room " + i,
              judgingSchedule[i][j].type === "robot"
                ? ROBOT_JUDGING_TYPE
                : PROJECT_JUDGING_TYPE
            )
          );
        }
      }

      this.genes.sort((a, b) => a.startTime - b.startTime);
    }
  }

  /**
   * Build a schedule organized by tables
   * @returns {Object} Schedule by tables
   */
  buildTableSchedule() {
    const tableSchedule = [];

    // Initialize the table arrays
    for (let i = 0; i < CONFIG.NUM_ROBOT_TABLES; i++) {
      tableSchedule[i] = [];
    }

    // Add events to the appropriate tables
    for (const event of this.genes) {
      if (event.type === TABLE_RUN_TYPE) {
        tableSchedule[event.locationID].push(event);
      }
    }

    // Sort each table's events by start time
    for (let i = 0; i < tableSchedule.length; i++) {
      tableSchedule[i].sort((a, b) => a.startTime - b.startTime);
    }

    return tableSchedule;
  }

  /**
   * Build a schedule organized by judging rooms
   * @returns {Object} Schedule by judging rooms
   */
  buildJudgingSchedule() {
    const judgingSchedule = [];

    // Initialize the judging room arrays
    for (let i = 0; i < CONFIG.NUM_JUDGING_ROOMS; i++) {
      judgingSchedule[i] = [];
    }

    // Add events to the appropriate judging rooms
    for (const event of this.genes) {
      if (
        event.type === PROJECT_JUDGING_TYPE ||
        event.type === ROBOT_JUDGING_TYPE
      ) {
        judgingSchedule[event.locationID].push(event);
      }
    }

    // Sort each judging room's events by start time
    for (let i = 0; i < judgingSchedule.length; i++) {
      judgingSchedule[i].sort((a, b) => a.startTime - b.startTime);
    }

    return judgingSchedule;
  }

  /**
   * Build a schedule organized by teams
   * @returns {Object} Schedule by teams
   */
  buildTeamsSchedule() {
    const teamsSchedule = {};

    // Initialize the team arrays
    for (let i = 1; i <= CONFIG.NUM_TEAMS; i++) {
      teamsSchedule[i] = [];
    }

    // Add events to the appropriate teams
    for (const event of this.genes) {
      teamsSchedule[event.teamID].push(event);
    }

    // Sort each team's events by start time
    for (const teamId in teamsSchedule) {
      teamsSchedule[teamId].sort((a, b) => a.startTime - b.startTime);
    }

    return teamsSchedule;
  }

  /**
   * Print the schedule to the console
   */
  printSchedule() {
    console.log("FLL COMPETITION SCHEDULE");
    console.log("=======================\n");

    // Print schedule summary
    console.log(`Number of Teams: ${CONFIG.NUM_TEAMS}`);
    console.log(`Number of Robot Tables: ${CONFIG.NUM_ROBOT_TABLES}`);
    console.log(`Number of Judging Rooms: ${CONFIG.NUM_JUDGING_ROOMS}`);
    console.log(`Schedule Score: ${this.score.toFixed(4)}\n`);

    // Print team schedules
    console.log("TEAM SCHEDULES");
    console.log("=============\n");

    const teamsSchedule = this.buildTeamsSchedule();

    for (let i = 1; i <= CONFIG.NUM_TEAMS; i++) {
      const teamEvents = teamsSchedule[i] || [];

      console.log(`Team ${i}:`);

      for (const event of teamEvents) {
        const startHour = Math.floor(event.startTime / 60);
        const startMinute = event.startTime % 60;
        const endHour = Math.floor((event.startTime + event.duration) / 60);
        const endMinute = (event.startTime + event.duration) % 60;

        const startTimeStr = `${startHour
          .toString()
          .padStart(2, "0")}:${startMinute.toString().padStart(2, "0")}`;
        const endTimeStr = `${endHour.toString().padStart(2, "0")}:${endMinute
          .toString()
          .padStart(2, "0")}`;

        let eventTypeStr = "";
        if (event.type === TABLE_RUN_TYPE) {
          eventTypeStr = "Robot Game";
        } else if (event.type === PROJECT_JUDGING_TYPE) {
          eventTypeStr = "Project Judging";
        } else if (event.type === ROBOT_JUDGING_TYPE) {
          eventTypeStr = "Robot Design Judging";
        }

        console.log(
          `  ${startTimeStr} - ${endTimeStr}: ${eventTypeStr} at ${event.locationName}`
        );
      }

      console.log("");
    }
  }
}

/**
 * Event class that matches the interface expected by the website
 */
class FLLEvent {
  constructor(
    teamID,
    teamName,
    startTime,
    duration,
    locationID,
    locationName,
    type
  ) {
    this.teamID = teamID;
    this.teamName = teamName;
    this.startTime = startTime;
    this.duration = duration;
    this.locationID = locationID;
    this.locationName = locationName;
    this.type = type;
  }

  equals(otherEvent) {
    return (
      this.teamID === otherEvent.teamID &&
      this.teamName === otherEvent.teamName &&
      this.startTime === otherEvent.startTime &&
      this.duration === otherEvent.duration &&
      this.locationID === otherEvent.locationID &&
      this.locationName === otherEvent.locationName &&
      this.type === otherEvent.type
    );
  }

  copy() {
    return new FLLEvent(
      this.teamID,
      this.teamName,
      this.startTime,
      this.duration,
      this.locationID,
      this.locationName,
      this.type
    );
  }
}

// Export the FLLSchedule class for use in the router
export { FLLSchedule };
