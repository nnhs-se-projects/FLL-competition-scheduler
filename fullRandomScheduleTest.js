import { fullRandom, score } from "./fullRandomSchedule.js";
import { jrGrading } from "./judgingRooms/JRGrading.js";
import { gradeTables } from "./tableGrading.js";

function validateSchedule(schedule) {
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

  console.log(teamsSchedule);

  // check that each time is scheduled for 3 table runs and 2 judging sessions
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
      return false;
    }
    if (judgingSessionCount !== 2) {
      console.log("Team " + i + " is not scheduled for 2 judging sessions");
      return false;
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
        return false;
      }
    }
  }

  return true;
}

for (let i = 0; i < 100; i++) {
  console.log("Test " + i);
  let schedule = fullRandom();
  if (schedule !== null) {
    if (!validateSchedule(schedule)) {
      console.log("test failed");
    } else {
      console.log("schedule score: " + score(schedule));
    }
  } else {
    i--;
  }
}
console.log("test passed");
