import { exec } from "child_process";
import CONFIG from "./config.js";
import { generateSimpleSchedule } from "./simpleScheduler.js";
import { optimizeSchedule } from "./geneticAlgorithm.js";
import { visualizeSchedule } from "./visualizer.js";
import { scheduleToJson } from "./utils.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    console.log(`Starting scheduling process for ${CONFIG.NUM_TEAMS} teams...`);

    // Generate a simple schedule
    console.log("Generating initial schedule...");
    const initialSchedule = generateSimpleSchedule(CONFIG.NUM_TEAMS);

    // Log the initial score
    console.log(`Initial schedule score: ${initialSchedule.score.toFixed(4)}`);

    // Save the initial schedule visualization
    const initialVisualization = visualizeSchedule(initialSchedule);
    fs.writeFileSync("initial_schedule.txt", initialVisualization);
    console.log("Initial schedule saved to initial_schedule.txt");

    // Optimize the schedule
    console.log("Optimizing schedule...");
    const optimizedSchedule = optimizeSchedule(initialSchedule);

    // Log the final score
    console.log(`Final schedule score: ${optimizedSchedule.score.toFixed(4)}`);

    // Save the optimized schedule visualization
    const optimizedVisualization = visualizeSchedule(optimizedSchedule);
    fs.writeFileSync("optimized_schedule.txt", optimizedVisualization);
    console.log("Optimized schedule saved to optimized_schedule.txt");

    // Convert to JSON and save
    const scheduleJson = scheduleToJson(optimizedSchedule);
    fs.writeFileSync("schedule.json", JSON.stringify(scheduleJson, null, 2));
    console.log("Schedule saved to schedule.json");

    // Start the web server
    console.log("Starting web server...");
    const serverProcess = exec(
      "node scheduleServer.js --port 3001",
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error starting server: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Server stderr: ${stderr}`);
          return;
        }
        console.log(`Server stdout: ${stdout}`);
      }
    );

    // Open the browser
    setTimeout(() => {
      console.log("Opening browser...");
      const openCommand =
        process.platform === "win32"
          ? "start"
          : process.platform === "darwin"
          ? "open"
          : "xdg-open";
      exec(`${openCommand} http://localhost:3001`, (error) => {
        if (error) {
          console.error(`Error opening browser: ${error.message}`);
          console.log(
            "Please open http://localhost:3001 in your browser manually."
          );
        }
      });

      console.log("\nPress Ctrl+C to stop the server and exit.");
    }, 1000);

    // Handle process termination
    process.on("SIGINT", () => {
      console.log("Stopping server...");
      serverProcess.kill();
      process.exit(0);
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
