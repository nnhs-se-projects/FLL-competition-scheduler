const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema({
  startTime: String,
  endTime: String,
  teamNumber: String,
  teamName: String,
  tableNumber: Number,
  roundNumber: Number,
});

const scheduleSchema = new mongoose.Schema({
  eventDate: {
    type: Date,
    required: true,
  },
  timeSlots: [timeSlotSchema],
  metadata: {
    totalTeams: Number,
    tablesAvailable: Number,
    roundsPerTeam: Number,
    timePerRound: Number,
  },
});

const Schedule = mongoose.model("Schedule", scheduleSchema);
module.exports = Schedule;
