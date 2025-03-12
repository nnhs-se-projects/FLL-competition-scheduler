/**
 * FLL Competition Scheduler - Simple Scheduler Runner
 *
 * This script runs the simplified scheduler and saves the results.
 */

import CONFIG from "./config.js";
import { generateSimpleSchedule } from "./simpleScheduler.js";
import { optimizeSchedule } from "./geneticAlgorithm.js";
import { visualizeSchedule, scheduleToJson } from "./visualizer.js";
import fs from "fs";

console.log("FLL Competition Scheduler - Simple Version");
console.log("==========================================");
console.log(`Generating schedule for ${CONFIG.NUM_TEAMS} teams...`);

try {
  // Generate a simple valid schedule
  console.log("Generating simple schedule...");
  const initialSchedule = generateSimpleSchedule();
  console.log(
    `Simple schedule generated with score: ${initialSchedule.score.toFixed(4)}`
  );

  // Save the initial schedule
  const initialVisualization = visualizeSchedule(initialSchedule);
  fs.writeFileSync("initial_schedule.txt", initialVisualization);
  console.log("Initial schedule saved to initial_schedule.txt");

  // Optimize the schedule using genetic algorithm
  console.log("\nOptimizing schedule using genetic algorithm...");
  const optimizedSchedule = optimizeSchedule(initialSchedule);
  console.log(
    `\nOptimization complete. Final score: ${optimizedSchedule.score.toFixed(
      4
    )}`
  );

  // Save the optimized schedule
  const optimizedVisualization = visualizeSchedule(optimizedSchedule);
  fs.writeFileSync("optimized_schedule.txt", optimizedVisualization);
  console.log("Optimized schedule saved to optimized_schedule.txt");

  // Convert the schedule to JSON
  const scheduleJson = scheduleToJson(optimizedSchedule);
  fs.writeFileSync("schedule.json", JSON.stringify(scheduleJson, null, 2));
  console.log("Schedule JSON saved to schedule.json");

  // Display a preview of the schedule
  console.log("\nSchedule Preview:");
  console.log(optimizedVisualization.split("\n").slice(0, 20).join("\n"));
  console.log("...");
} catch (error) {
  console.error("Error:", error);
}
