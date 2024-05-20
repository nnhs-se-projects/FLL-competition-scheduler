// THIS FUNCTION IS UNTESTED
import { randomJS } from "./judgingRooms/randomJudgingSesh.js";
import { jrGrading } from "./judgingRooms/JRGrading.js";

function fullRandom() {
  // creates valid random judging room
  let judgingRooms = randomJS();
  while (jrGrading(judgingRooms) === 0) {
    judgingRooms = randomJS();
  }
  // creates array of 32 teams each present 3 times
  let tables = [];
  let tablePool = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 1; j < 33; j++) {
      let team = {
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
  tables = [t1, t2, t3, t4];
  let fullSchedule = [tables, judgingRooms];
  return fullSchedule;
}

for (let i = 0; i < 100; i++) {
  console.log("Test " + i);
  let test = fullRandom();
  if (test !== null) {
    console.log(test[0]);
    console.log(test[1]);
  }
}
export { fullRandom };
