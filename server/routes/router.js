const express = require("express");
const route = express.Router();
const Entry = require("../model/entry");

// easy way to assign static data (e.g., array of strings) to a variable
const habitsOfMind = require("../model/habitsOfMind.json");

// pass a path (e.g., "/") and a callback function to the get method
//  when the client makes an HTTP GET request to the specified path,
//  the callback function is executed
route.get("/", async (req, res) => {
  // the req parameter references the HTTP request object, which has
  //  a number of properties
  console.log("path: ", req.path);
  try {
    const entries = await Entry.find().sort({ date: -1 });

    // Convert MongoDB objects to ejs format

    const formattedEntries = entries.map((entry) => {
      return {
        id: entry._id,
        date: entry.date.toLocaleDateString(),
        habit: entry.habit,
        content: entry.content.slice(0, 20) + "...",
      };
    });

    // Send sorted entries to client
    res.render("index", { entries: formattedEntries });
  } catch (error) {
    console.error("Error fetching entries:", error);
    res.status(500).send("Error loading entries");
  }
});

// Route to display the create entry page
route.get("/createEntry", (req, res) => {
  res.render("createEntry", { habits: habitsOfMind });
});

// Route to handle the creation of a new entry
route.post("/createEntry", async (req, res) => {
  const entry = new Entry({
    date: new Date(req.body.date + "T00:00:00"),
    email: req.session.email,
    habit: req.body.habit,
    content: req.body.content,
  });
  await entry.save();

  res.status(201).end();
});

// Route to display the edit entry page
route.get("/editEntry/:id", async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry) {
      return res.status(404).send("Entry not found");
    }
    res.render("editEntry", { entry, habits: habitsOfMind });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading edit entry page");
  }
});

// Route to handle updates to an existing entry
route.post("/editEntry/:id", async (req, res) => {
  try {
    const updatedEntry = {
      date: req.body.date,
      habit: req.body.habit,
      content: req.body.content,
    };
    const entry = await Entry.findByIdAndUpdate(req.params.id, updatedEntry, {
      new: true,
    });
    if (!entry) {
      return res.status(404).send("Entry not found");
    }
    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating entry");
  }
});

// Route to delete an entry
route.post("/deleteEntry/:id", async (req, res) => {
  try {
    const entry = await Entry.findByIdAndDelete(req.params.id);
    if (!entry) {
      return res.status(404).send("Entry not found");
    }
    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting entry");
  }
});

// delegate all authentication to the auth.js router
route.use("/auth", require("./auth"));

module.exports = route;
