const express = require("express");
const route = express.Router();
const Entry = require("../model/entry");
const { FLLSchedule } = require("../../tspPort/fllSchedule");
const fs = require("fs");
const path = require("path");

// easy way to assign static data (e.g., array of strings) to a variable
const habitsOfMind = require("../model/habitsOfMind.json");

// Path to store the generated schedule
const SCHEDULE_FILE_PATH = path.join(__dirname, "../../data/schedule.json");

// Function to ensure the data directory exists
function ensureDataDirectoryExists() {
  const dataDir = path.join(__dirname, "../../data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Function to load the schedule from file
function loadSchedule() {
  ensureDataDirectoryExists();

  if (fs.existsSync(SCHEDULE_FILE_PATH)) {
    try {
      // Read the file fresh each time
      const scheduleData = fs.readFileSync(SCHEDULE_FILE_PATH, "utf8");
      return JSON.parse(scheduleData);
    } catch (error) {
      console.error("Error loading schedule:", error);
      return null;
    }
  }
  return null;
}

// Overview route
route.get("/", async (req, res) => {
  try {
    // Check if there's a schedule in the session
    let schedule = req.session.schedule;

    // If not, try to load from file
    if (!schedule) {
      const scheduleFilePath = path.join(__dirname, "../../data/schedule.json");
      if (fs.existsSync(scheduleFilePath)) {
        const scheduleData = fs.readFileSync(scheduleFilePath, "utf8");
        schedule = JSON.parse(scheduleData);
      }
    }

    res.render("overview", { path: "/", schedule });
  } catch (error) {
    console.error("Error rendering overview:", error);
    res.status(500).send("Error rendering overview page");
  }
});

route.get("/tables", (req, res) => {
  // Load the schedule fresh on each request
  const schedule = loadSchedule();
  res.render("tables", { path: "/tables", schedule });
});

route.get("/judging", (req, res) => {
  // Load the schedule fresh on each request
  const schedule = loadSchedule();
  res.render("judging", { path: "/judging", schedule });
});

route.get("/teams", (req, res) => {
  // Load the schedule fresh on each request
  const schedule = loadSchedule();
  res.render("teams", { path: "/teams", schedule });
});

route.get("/configuration", (req, res) => {
  res.render("configuration", { path: "/configuration" });
});

// API endpoint to generate a new schedule
route.post("/api/generate-schedule", async (req, res) => {
  try {
    // Get configuration from request body
    const { numTeams, numTables, numJudgingRooms, teamNames, startTime } =
      req.body;

    // Create a new FLL schedule
    const fllSchedule = new FLLSchedule(numTeams, numTables, numJudgingRooms);

    // Set team names if provided
    if (teamNames && teamNames.length > 0) {
      fllSchedule.setTeamNames(teamNames);
    }

    // Set start time if provided
    if (startTime) {
      fllSchedule.setStartTime(startTime);
    }

    // Generate the schedule
    const schedule = fllSchedule.generateSchedule();

    // Store the schedule in the session
    req.session.schedule = schedule;

    // Save the schedule to a file
    const scheduleFilePath = path.join(__dirname, "../../data/schedule.json");
    fs.writeFileSync(scheduleFilePath, JSON.stringify(schedule, null, 2));

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error generating schedule:", error);
    res.status(500).json({ error: error.message });
  }
});

route.get("/createEntry", (req, res) => {
  res.render("createEntry", { habits: habitsOfMind });
});

route.get("/example", (req, res) => {
  const schedule = new FLLSchedule();
  schedule.populateWithRandomGenes();
  schedule.printSchedule();
  res.send(JSON.stringify(schedule));
});

route.post("/createEntry", async (req, res) => {
  const entry = new Entry({
    // When the time zone offset is absent, date-only forms are interpreted as
    //  a UTC time and date-time forms are interpreted as a local time. We want
    //  the date object to reflect local time; so add a time of midnight.
    date: new Date(req.body.date + "T00:00:00"),
    email: req.session.email,
    habit: req.body.habit,
    content: req.body.content,
  });
  await entry.save();

  res.status(201).end();
});

route.get("/editEntry/:id", async (req, res) => {
  const entry = await Entry.findById(req.params.id);
  console.log(entry);
  res.send(entry);
});

// delegate all authentication to the auth.js router
route.use("/auth", require("./auth"));

module.exports = route;
