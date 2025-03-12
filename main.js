/**
 * FLL Competition Scheduler - Main Entry Point
 *
 * This file serves as the main entry point for the FLL competition scheduling system.
 */

import CONFIG from "./config.js";
import { generateSchedule } from "./scheduler.js";
import { optimizeSchedule } from "./geneticAlgorithm.js";
import { visualizeSchedule, scheduleToJson } from "./visualizer.js";

/**
 * Main function to generate and optimize an FLL competition schedule
 */
function main() {
  console.log("FLL Competition Scheduler");
  console.log("========================");
  console.log(`Generating schedule for ${CONFIG.NUM_TEAMS} teams...`);

  try {
    // Generate an initial valid schedule
    console.log("Generating initial schedule...");
    const initialSchedule = generateSchedule();
    console.log(
      `Initial schedule generated with score: ${initialSchedule.score.toFixed(
        4
      )}`
    );

    // Optimize the schedule using genetic algorithm
    console.log("\nOptimizing schedule using genetic algorithm...");
    const optimizedSchedule = optimizeSchedule(initialSchedule);
    console.log(
      `\nOptimization complete. Final score: ${optimizedSchedule.score.toFixed(
        4
      )}`
    );

    // Display the optimized schedule
    console.log("\n" + visualizeSchedule(optimizedSchedule));

    // Convert the schedule to JSON
    const scheduleJson = scheduleToJson(optimizedSchedule);
    console.log("Schedule JSON:");
    console.log(JSON.stringify(scheduleJson, null, 2));

    return optimizedSchedule;
  } catch (error) {
    console.error("Error generating schedule:", error);
    return null;
  }
}

// Run the main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };
