route.post("/save-config", (req, res) => {
  const config = {
    numTeams: parseInt(req.body.numTeams),
    // ... other existing config properties ...
    teamNames: req.body.teamNames || [],
  };

  // Save to session
  req.session.config = config;

  // Clear existing schedule when config changes
  req.session.schedule = null;

  res.redirect("/schedule-config");
});

// Modify the generateNewSchedule function to use custom team names
function generateNewSchedule(config) {
  const schedule = new FLLSchedule();
  schedule.populateWithRandomGenes();

  // Add team names to the schedule
  const teamNames = config.teamNames || [];
  const scheduleData = {
    tableRuns: schedule.buildTableSchedule(),
    judgingSchedule: schedule.buildJudgingSchedule(),
    teamsSchedule: schedule.buildTeamsSchedule(),
  };

  // Replace default team numbers with custom names
  [
    scheduleData.tableRuns,
    scheduleData.judgingSchedule,
    scheduleData.teamsSchedule,
  ].forEach((scheduleType) => {
    if (Array.isArray(scheduleType)) {
      scheduleType.forEach((item) => {
        if (item.teamNumber !== undefined && teamNames[item.teamNumber]) {
          item.teamName = teamNames[item.teamNumber];
        }
      });
    }
  });

  return scheduleData;
}

// Update the schedule generation route
route.get("/regenerate-schedule", (req, res) => {
  const config = req.session.config || {};
  req.session.schedule = generateNewSchedule(config);
  res.redirect(req.headers.referer || "/schedule-config");
});
