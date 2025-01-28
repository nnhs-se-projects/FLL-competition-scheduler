const express = require("express");
const router = express.Router();
const Schedule = require("../model/schedule.cjs");

// Get all schedules
router.get("/", async (req, res) => {
  try {
    const schedules = await Schedule.find();
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new schedule
router.post("/", async (req, res) => {
  const schedule = new Schedule({
    eventDate: req.body.eventDate,
    timeSlots: req.body.timeSlots,
    metadata: req.body.metadata,
  });

  try {
    const newSchedule = await schedule.save();
    res.status(201).json(newSchedule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get specific schedule
router.get("/:id", async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (schedule) {
      res.json(schedule);
    } else {
      res.status(404).json({ message: "Schedule not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
