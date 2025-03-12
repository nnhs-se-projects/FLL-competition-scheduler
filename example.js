/**
 * FLL Competition Scheduler - Example Usage
 *
 * This file demonstrates how to use the FLL competition scheduler with custom configurations.
 */

import CONFIG from "./config.js";
import { generateSchedule } from "./scheduler.js";
import { optimizeSchedule } from "./geneticAlgorithm.js";
import { visualizeSchedule, scheduleToJson } from "./visualizer.js";
import fs from "fs";

// Example 1: Generate a schedule with default configuration
function example1() {
  console.log("Example 1: Generate a schedule with default configuration");
  console.log("=======================================================");

  const schedule = generateSchedule();
  console.log(`Schedule generated with score: ${schedule.score.toFixed(4)}`);
  console.log("Number of events:", schedule.getSize());

  // Display a summary of the schedule
  const teamSchedule = schedule.buildTeamSchedule();
  console.log("\nTeam 1 Schedule:");

  for (const event of teamSchedule[1]) {
    console.log(
      `- ${event.type} at ${event.locationName} (Start: ${event.startTime})`
    );
  }

  console.log("\n");
}

// Example 2: Generate a schedule with custom configuration
function example2() {
  console.log("Example 2: Generate a schedule with custom configuration");
  console.log("=======================================================");

  // Save original configuration
  const originalNumTeams = CONFIG.NUM_TEAMS;
  const originalRoundsPerTeam = CONFIG.ROUNDS_PER_TEAM;

  // Modify configuration
  CONFIG.NUM_TEAMS = 16;
  CONFIG.ROUNDS_PER_TEAM = 2;

  const schedule = generateSchedule();
  console.log(`Schedule generated with score: ${schedule.score.toFixed(4)}`);
  console.log("Number of events:", schedule.getSize());

  // Restore original configuration
  CONFIG.NUM_TEAMS = originalNumTeams;
  CONFIG.ROUNDS_PER_TEAM = originalRoundsPerTeam;

  console.log("\n");
}

// Example 3: Optimize a schedule
function example3() {
  console.log("Example 3: Optimize a schedule");
  console.log("=============================");

  // Save original configuration
  const originalPopSize = CONFIG.GENETIC.POPULATION_SIZE;
  const originalGenerations = CONFIG.GENETIC.GENERATIONS;

  // Modify configuration for faster execution
  CONFIG.GENETIC.POPULATION_SIZE = 20;
  CONFIG.GENETIC.GENERATIONS = 5;

  const initialSchedule = generateSchedule();
  console.log(`Initial schedule score: ${initialSchedule.score.toFixed(4)}`);

  const optimizedSchedule = optimizeSchedule(initialSchedule);
  console.log(
    `Optimized schedule score: ${optimizedSchedule.score.toFixed(4)}`
  );

  // Restore original configuration
  CONFIG.GENETIC.POPULATION_SIZE = originalPopSize;
  CONFIG.GENETIC.GENERATIONS = originalGenerations;

  console.log("\n");
}

// Example 4: Export a schedule to JSON
function example4() {
  console.log("Example 4: Export a schedule to JSON");
  console.log("===================================");

  const schedule = generateSchedule();
  const scheduleJson = scheduleToJson(schedule);

  // Write to file
  fs.writeFileSync("schedule.json", JSON.stringify(scheduleJson, null, 2));
  console.log("Schedule exported to schedule.json");

  console.log("\n");
}

// Example 5: Visualize a schedule
function example5() {
  console.log("Example 5: Visualize a schedule");
  console.log("==============================");

  const schedule = generateSchedule();
  const visualization = visualizeSchedule(schedule);

  // Write to file
  fs.writeFileSync("schedule.txt", visualization);
  console.log("Schedule visualization exported to schedule.txt");

  // Display a preview
  console.log("\nPreview:");
  console.log(visualization.split("\n").slice(0, 10).join("\n"));
  console.log("...");

  console.log("\n");
}

// Run all examples
function runAllExamples() {
  example1();
  example2();
  example3();
  example4();
  example5();
}

// Run the examples if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  runAllExamples();
}

export { runAllExamples };
