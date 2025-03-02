// THIS FUNCTION IS UNTESTED
const { randomJS } = require("./judgingRooms/randomJudgingSesh.js");
const { jrGrading } = require("./judgingRooms/JRGrading.js");

const DEBUG = true;

function createFullSchedule(
  teamNames = [],
  numTeams = 32,
  numTables = 4,
  numJudgingRooms = 8
) {
  console.log(
    `Starting schedule generation with ${numTeams} teams, ${numTables} tables, and ${numJudgingRooms} judging rooms`
  );

  // Ensure we have enough team names
  const normalizedTeamNames = [];
  for (let i = 0; i < numTeams; i++) {
    normalizedTeamNames[i] = teamNames[i] || `Team ${i + 1}`;
  }

  let schedule;
  let valid = false;
  let attempts = 0;
  const MAX_ATTEMPTS = 100; // Prevent infinite loops

  console.log("Attempting to generate an optimal schedule...");

  while (!valid && attempts < MAX_ATTEMPTS) {
    attempts++;
    if (attempts % 10 === 0) {
      console.log(`Attempt ${attempts}/${MAX_ATTEMPTS}...`);
    }

    try {
      schedule = fullRandom(
        normalizedTeamNames,
        numTeams,
        numTables,
        numJudgingRooms
      );

      if (schedule === null) {
        console.log(
          `Attempt ${attempts}: Failed to create schedule (null result)`
        );
        continue;
      }

      const score = scoreSchedule(schedule);
      console.log(`Attempt ${attempts}: Schedule score = ${score}`);
      valid = score > 0.0;
    } catch (error) {
      console.error(`Error in attempt ${attempts}:`, error.message);
    }
  }

  // If we couldn't generate a valid schedule, create a simple one
  if (!valid) {
    console.warn(
      "Could not generate optimal schedule after max attempts. Creating basic schedule."
    );
    schedule = createBasicSchedule(
      normalizedTeamNames,
      numTeams,
      numTables,
      numJudgingRooms
    );
    console.log("Created basic fallback schedule");
  } else {
    console.log(`Successfully generated schedule after ${attempts} attempts`);
  }

  return schedule;
}

function fullRandom(
  teamNames = [],
  numTeams = 32,
  numTables = 4,
  numJudgingRooms = 8
) {
  console.log("Starting fullRandom generation...");

  // creates valid random judging room
  console.log("Generating judging rooms...");
  let judgingRooms;
  try {
    judgingRooms = randomJS(teamNames, numTeams, numJudgingRooms);
    console.log(`Created ${judgingRooms.length} judging rooms`);

    const jrScore = jrGrading(judgingRooms);
    console.log(`Judging rooms score: ${jrScore}`);

    let jrAttempts = 1;
    const MAX_JR_ATTEMPTS = 20;

    while (jrGrading(judgingRooms) === 0 && jrAttempts < MAX_JR_ATTEMPTS) {
      console.log(
        `Judging room attempt ${jrAttempts}: Invalid configuration, regenerating...`
      );
      judgingRooms = randomJS(teamNames, numTeams, numJudgingRooms);
      jrAttempts++;
    }

    if (jrAttempts >= MAX_JR_ATTEMPTS) {
      console.log("Failed to generate valid judging rooms after max attempts");
      return null;
    }

    console.log(`Valid judging rooms created after ${jrAttempts} attempts`);
  } catch (error) {
    console.error("Error generating judging rooms:", error.message);
    return null;
  }

  // creates array of teams each present 3 times
  console.log("Creating table pool...");
  const tablePool = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 1; j <= numTeams; j++) {
      const teamName = teamNames[j - 1] || `team${j}`;
      const team = {
        id: j,
        name: teamName,
        run: i,
        duration: 10,
        start: 0,
      };
      tablePool.push(team);
    }
  }
  console.log(`Created table pool with ${tablePool.length} entries`);

  // initializes tables, and an array for tested teams.
  const tables = [];
  for (let i = 0; i < numTables; i++) {
    tables.push([]);
  }
  console.log(`Initialized ${numTables} tables`);

  const tested = [];
  console.log("Starting table assignment...");

  for (let i = 0; i < numTables; i++) {
    console.log(`Assigning teams to table ${i + 1}...`);
    let count = 0;
    for (let j = 0; j < 24; j++) {
      // exit conditions
      if (count > 300) {
        console.log(`Exceeded maximum attempts (${count}) for table ${i + 1}`);
        return null;
      }
      if (tablePool.length === 0) {
        console.log(`Table pool is empty for table ${i + 1}`);
        return null;
      }

      count++;
      if (count % 50 === 0) {
        console.log(`Table ${i + 1}, attempt ${count}...`);
      }

      // gets random number
      let randomNum = Math.floor(Math.random() * tablePool.length);
      // establishes start time of the team
      let startTime = 0;
      if (i === 0 || i === 1) {
        startTime = j * 10;
        if (startTime >= 150) {
          startTime = startTime + 45;
        }
      } else {
        startTime = 5 + j * 10;
        if (startTime >= 145) {
          startTime = startTime + 55;
        }
      }
      // sets start time of the team
      tablePool[randomNum].start = startTime;
      let judgingTime = [];
      let tableTimes = [];
      // gets any other times the team is already present at the tables
      // ranges 0-2
      for (let k = 0; k < tables[i].length; k++) {
        if (tables[i][k].name === tablePool[randomNum].name)
          tableTimes.push(tables[i][k].start);
      }
      // gets the times the team is at the judging rooms
      for (let k = 0; k < numJudgingRooms; k++) {
        for (let l = 0; l < numJudgingRooms; l++) {
          if (judgingRooms[k][l].name === tablePool[randomNum].name) {
            judgingTime.push(judgingRooms[k][l].startT);
          }
        }
      }
      let fail = false;
      // checks if the team would have an overlap if it was placed at the table (minimum 10 minutes between events)
      if (
        (startTime < judgingTime[0] && startTime + 20 > judgingTime[0]) ||
        (startTime < judgingTime[1] && startTime + 20 > judgingTime[1]) ||
        (judgingTime[0] <= startTime && judgingTime[0] + 25 > startTime) ||
        (judgingTime[1] <= startTime && judgingTime[1] + 25 > startTime)
      ) {
        fail = true;
      }
      for (let k = 0; k < tableTimes.length; k++) {
        if (Math.abs(startTime - tableTimes[k]) < 20) {
          fail = true;
        }
      }
      // checks if the team is already scheduled on this table
      if (tables[i].some((e) => e.name == tablePool[randomNum].name)) {
        fail = true;
      }

      if (fail === true) {
        // adds the team to test and removes it from the table pool if it would overlap
        tested.push(tablePool[randomNum]);
        tablePool.splice(randomNum, 1);
        j--;
      } else {
        // adds the team to the table if it would not overlap
        if (i === 0) {
          tables[i].push(tablePool[randomNum]);
          let length = tested.length;
          for (let x = 0; x < length; x++) {
            // add tested teams back to the table pool
            tablePool.push(tested[x]);
          }
          // removes tested teams from the tested array
          tested.splice(0, tested.length);
          // removes the team from the table pool
          tablePool.splice(randomNum, 1);
        } else if (i === 1) {
          tables[i].push(tablePool[randomNum]);
          let length = tested.length;
          for (let x = 0; x < length; x++) {
            tablePool.push(tested[x]);
          }
          tested.splice(0, tested.length);
          tablePool.splice(randomNum, 1);
        } else if (i === 2) {
          tables[i].push(tablePool[randomNum]);
          let length = tested.length;
          for (let x = 0; x < length; x++) {
            tablePool.push(tested[x]);
          }
          tested.splice(0, tested.length);
          tablePool.splice(randomNum, 1);
        }
      }
    }
    console.log(`Completed assignments for table ${i + 1}`);
  }

  console.log("Table assignment complete");
  let fullSchedule = [tables, judgingRooms];
  return fullSchedule;
}

function scoreSchedule(schedule) {
  const tableSchedule = schedule[0];
  const judgingSchedule = schedule[1];
  const teamsSchedule = buildTeamsSchedule(schedule);

  // extra checks when debugging
  if (DEBUG) {
    // iterate through each table
    for (let i = 0; i < tableSchedule.length; i++) {
      tableSchedule[i].sort((a, b) => a.start - b.start);
      // iterate through each table run at the table
      for (let j = 0; j < tableSchedule[i].length - 1; j++) {
        if (
          tableSchedule[i][j].start + tableSchedule[i][j].duration >
          tableSchedule[i][j + 1].start
        ) {
          console.log("Table " + i + " has overlapping table runs");
          return 0.0;
        }
      }
    }

    // iterate through each judging room
    for (let i = 0; i < judgingSchedule.length; i++) {
      judgingSchedule[i].sort((a, b) => a.startT - b.startT);
      // iterate through each team in the judging room
      for (let j = 0; j < judgingSchedule[i].length - 1; j++) {
        if (
          judgingSchedule[i][j].startT + judgingSchedule[i][j].duration >
          judgingSchedule[i][j + 1].startT
        ) {
          console.log(
            "Judging room " + i + " has overlapping judging sessions"
          );
          return 0.0;
        }
      }
    }
  }

  // check that each team is scheduled for 3 table runs and 2 judging sessions
  for (let i = 1; i <= 32; i++) {
    let tableRunCount = 0;
    let judgingSessionCount = 0;
    for (const event of teamsSchedule[i]) {
      if (event.event === "tableRun") {
        tableRunCount++;
      } else {
        judgingSessionCount++;
      }
    }
    if (tableRunCount !== 3) {
      console.log("Team " + i + " is not scheduled for 3 table runs");
      return 0.0;
    }
    if (judgingSessionCount !== 2) {
      console.log("Team " + i + " is not scheduled for 2 judging sessions");
      return 0.0;
    }
  }

  // check that no two events for a team overlap
  for (let i = 1; i <= 32; i++) {
    const teamSchedule = teamsSchedule[i];
    teamSchedule.sort((a, b) => a.startTime - b.startTime);
    for (let j = 0; j < teamSchedule.length - 1; j++) {
      if (
        teamSchedule[j].startTime + teamSchedule[j].duration >
        teamSchedule[j + 1].startTime
      ) {
        console.log("Team " + i + " has overlapping events");
        return 0.0;
      }
    }
  }

  // score based on the time between a team's scheduled events
  // we want to optimize for a reasonable time between events and a consistent time between events
  // we will consider 50 minutes between events to be ideal and worth 0.25 points per interval
  // for a total of 1.0 points per team
  let score = 0.0;

  for (let i = 1; i <= 32; i++) {
    const teamSchedule = teamsSchedule[i];
    for (let j = 0; j < teamSchedule.length - 1; j++) {
      const duration =
        teamSchedule[j + 1].startTime -
        (teamSchedule[j].startTime + teamSchedule[j].duration);
      score += 0.25 * (Math.min(duration, 50) / 50.0);
    }
  }

  return score / 32.0;
}

function logTeamSchedules(schedule) {
  const teamsSchedule = buildTeamsSchedule(schedule);

  for (let i = 1; i <= 32; i++) {
    console.log("Team " + i + ":");
    for (const event of teamsSchedule[i]) {
      if (event.event === "tableRun") {
        console.log(
          "  Table Run: " +
            event.startTime +
            " - " +
            (event.startTime + event.duration)
        );
      } else {
        console.log(
          "  Judging Session: " +
            event.startTime +
            " - " +
            (event.startTime + event.duration)
        );
      }
    }
  }
}

function logJudgingRoomsSchedule(schedule) {
  const judgingSchedule = schedule[1];

  // iterate through each judging room
  for (let i = 0; i < judgingSchedule.length; i++) {
    // iterate through each team in the judging room
    let displayString = "Judging Room " + i + ":\t";
    for (let j = 0; j < judgingSchedule[i].length; j++) {
      const session = judgingSchedule[i][j];
      displayString += session.id + "\t";
    }
    console.log(displayString);
  }
}

function logTableRunsSchedule(schedule) {
  const tableSchedule = schedule[0];

  // iterate through each table
  for (let i = 0; i < tableSchedule.length; i++) {
    // iterate through each table run at the table
    let displayString = "Table Run " + i + ":\t";
    for (let j = 0; j < tableSchedule[i].length; j++) {
      const tableRun = tableSchedule[i][j];
      displayString += tableRun.id + "\t";
    }
    console.log(displayString);
  }
}

function buildTeamsSchedule(schedule) {
  const tableSchedule = schedule[0];
  const judgingSchedule = schedule[1];
  const teamsSchedule = [];

  // initialize teamsSchedule
  for (let i = 1; i <= 32; i++) {
    teamsSchedule[i] = [];
  }

  // iterate through each table
  for (let i = 0; i < tableSchedule.length; i++) {
    // iterate through each table run at the table
    for (let j = 0; j < tableSchedule[i].length; j++) {
      const tableRun = tableSchedule[i][j];
      teamsSchedule[tableRun.id].push({
        startTime: tableRun.start,
        duration: tableRun.duration,
        event: "tableRun",
      });
    }
  }

  // iterate through each judging room
  for (let i = 0; i < judgingSchedule.length; i++) {
    // iterate through each team in the judging room
    for (let j = 0; j < judgingSchedule[i].length; j++) {
      const session = judgingSchedule[i][j];
      teamsSchedule[session.id].push({
        startTime: session.startT,
        duration: session.duration,
        event: "judgingSession",
      });
    }
  }

  teamsSchedule.forEach((teamSchedule) => {
    teamSchedule.sort((a, b) => a.startTime - b.startTime);
  });

  return teamsSchedule;
}

function printSchedule(schedule) {
  const teamsSchedule = buildTeamsSchedule(schedule);

  const scheduleJSON = {};

  for (let i = 1; i <= 32; i++) {
    scheduleJSON[`Team ${i}`] = teamsSchedule[i].map((event) => ({
      eventType: event.event, // "tableRun" or "judgingSession"
      startTime: event.startTime,
      duration: event.duration,
      endTime: event.startTime + event.duration,
    }));
  }

  console.log(JSON.stringify(scheduleJSON, null, 2));
}

// Update the createBasicSchedule function to use configuration parameters
function createBasicSchedule(
  teamNames,
  numTeams = 32,
  numTables = 4,
  numJudgingRooms = 8
) {
  console.log("Creating basic fallback schedule...");

  const tables = [];
  const judgingRooms = [];

  // Initialize tables
  for (let i = 0; i < numTables; i++) {
    tables.push([]);
  }
  console.log(`Initialized ${numTables} tables`);

  // Initialize judging rooms
  for (let i = 0; i < numJudgingRooms; i++) {
    judgingRooms.push([]);
  }
  console.log(`Initialized ${numJudgingRooms} judging rooms`);

  // Create a simple schedule for each team
  console.log(`Assigning ${numTeams} teams to schedule...`);
  for (let i = 0; i < numTeams; i++) {
    const teamId = i + 1;
    const teamName = teamNames[i];

    // Add to tables (3 runs per team)
    for (let run = 0; run < 3; run++) {
      const tableIndex = run % numTables;
      const startTime = i * 10 + run * 100; // Simple time spacing

      tables[tableIndex].push({
        id: teamId,
        name: teamName,
        run: run,
        duration: 10,
        start: startTime,
      });
    }

    // Add to judging rooms (2 sessions per team)
    const robotRoomCount = Math.floor(numJudgingRooms / 2);
    const projectRoomCount = numJudgingRooms - robotRoomCount;

    const robotRoom = i % robotRoomCount;
    const projectRoom = robotRoomCount + (i % projectRoomCount);

    // Robot judging
    judgingRooms[robotRoom].push({
      id: teamId,
      name: teamName,
      startT: i * 25,
      duration: 15,
      type: "robot",
    });

    // Project judging
    judgingRooms[projectRoom].push({
      id: teamId,
      name: teamName,
      startT: i * 25 + 100, // Offset from robot judging
      duration: 15,
      type: "project",
    });
  }

  console.log("Basic schedule creation complete");
  return [tables, judgingRooms];
}

module.exports = {
  createFullSchedule,
  scoreSchedule,
  buildTeamsSchedule,
  logTeamSchedules,
  logJudgingRoomsSchedule,
  logTableRunsSchedule,
  printSchedule,
};
