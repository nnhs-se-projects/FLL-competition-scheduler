const express = require("express");
const route = express.Router();
const Entry = require("../model/entry");
const { FLLSchedule } = require("../../tspPort/fllSchedule");

// easy way to assign static data (e.g., array of strings) to a variable
const habitsOfMind = require("../model/habitsOfMind.json");

// pass a path (e.g., "/") and a callback function to the get method
//  when the client makes an HTTP GET request to the specified path,
//  the callback function is executed
route.get("/", (req, res) => {
  if (req.session.email) {
    // If logged in, show the schedule page
    const schedule = new FLLSchedule();
    schedule.populateWithRandomGenes();
    res.render("index", {
      schedule: {
        tableRuns: schedule.buildTableSchedule(),
        judgingSchedule: schedule.buildJudgingSchedule(),
        teamsSchedule: schedule.buildTeamsSchedule(),
      },
    });
  } else {
    // If not logged in, show the landing page
    res.render("landing");
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
