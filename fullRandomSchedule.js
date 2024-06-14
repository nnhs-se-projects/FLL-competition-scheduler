// THIS FUNCTION IS UNTESTED
import { randomJS } from "./judgingRooms/randomJudgingSesh.js";
import { jrGrading } from "./judgingRooms/JRGrading.js";

const DEBUG = true;

function createFullSchedule() {
  let schedule;
  let valid = false;
  while (!valid) {
    schedule = fullRandom();
    valid = schedule !== null && scoreSchedule(schedule) > 0.0;
  }
  return schedule;
}

function fullRandom() {
  // creates valid random judging room
  let judgingRooms = randomJS();
  while (jrGrading(judgingRooms) === 0) {
    judgingRooms = randomJS();
  }
  // creates array of 32 teams each present 3 times
  let tablePool = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 1; j < 33; j++) {
      let team = {
        id: j,
        name: "team" + j,
        run: i,
        duration: 10,
        start: 0,
      };
      tablePool.push(team);
    }
  }
  // initializes 4 tables, and an array for tested teams.
  let t1 = [];
  let t2 = [];
  let t3 = [];
  let t4 = [];
  let tables = [t1, t2, t3, t4];
  let tested = [];
  for (let i = 0; i < 4; i++) {
    let count = 0;
    for (let j = 0; j < 24; j++) {
      // exit conditions
      if (count > 300) {
        return null;
      }
      if (tablePool.length === 0) {
        return null;
      }
      count++;
      // gets random number
      let randomNum = Math.floor(Math.random() * tablePool.length);
      // establishes start time of the team
      let startTime = 0;
      if (i === 0 || i === 1) {
        startTime = j * 10;
        if (startTime > 140) {
          startTime = startTime + 50;
        }
      } else {
        startTime = 5 + j * 10;
        if (startTime > 140) {
          startTime = startTime + 50;
        }
      }
      // sets start time of the team
      tablePool[randomNum].start = startTime;
      let judgingTime = [];
      let tableTimes = [];
      // gets any other times the team is already present at the tables
      // ranges 0-2
      for (let k = 0; k < t1.length; k++) {
        if (t1[k].name === tablePool[randomNum].name)
          tableTimes.push(t1[k].start);
      }
      for (let k = 0; k < t2.length; k++) {
        if (t2[k].name === tablePool[randomNum].name)
          tableTimes.push(t2[k].start);
      }
      for (let k = 0; k < t3.length; k++) {
        if (t3[k].name === tablePool[randomNum].name)
          tableTimes.push(t3[k].start);
      }
      for (let k = 0; k < t4.length; k++) {
        if (t4[k].name === tablePool[randomNum].name)
          tableTimes.push(t4[k].start);
      }
      // gets the times the team is at the judging rooms
      for (let k = 0; k < 8; k++) {
        for (let l = 0; l < 8; l++) {
          if (judgingRooms[k][l].name === tablePool[randomNum].name) {
            judgingTime.push(judgingRooms[k][l].startT);
          }
        }
      }
      let fail = false;
      // checks if the team would have an overlap if it was placed at the table
      if (
        Math.abs(startTime - judgingTime[0]) < 20 ||
        Math.abs(startTime - judgingTime[1]) < 20
      ) {
        fail = true;
      }
      for (let k = 0; k < tableTimes.length; k++) {
        if (Math.abs(startTime - tableTimes[k]) < 15) {
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
          t1.push(tablePool[randomNum]);
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
          t2.push(tablePool[randomNum]);
          let length = tested.length;
          for (let x = 0; x < length; x++) {
            tablePool.push(tested[x]);
          }
          tested.splice(0, tested.length);
          tablePool.splice(randomNum, 1);
        } else if (i === 2) {
          t3.push(tablePool[randomNum]);
          let length = tested.length;
          for (let x = 0; x < length; x++) {
            tablePool.push(tested[x]);
          }
          tested.splice(0, tested.length);
          tablePool.splice(randomNum, 1);
        } else {
          t4.push(tablePool[randomNum]);
          let length = tested.length;
          for (let x = 0; x < length; x++) {
            tablePool.push(tested[x]);
          }
          tested.splice(0, tested.length);
          tablePool.splice(randomNum, 1);
        }
      }
    }
  }
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

export {
  createFullSchedule,
  scoreSchedule,
  buildTeamsSchedule,
  logTeamSchedules,
  logJudgingRoomsSchedule,
  logTableRunsSchedule,
};
