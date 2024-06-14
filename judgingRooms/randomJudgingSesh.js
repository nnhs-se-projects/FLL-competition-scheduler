// number of teams (must be configurable)
// number of judging rooms (should be configurable; start with 8)
// number of judging sessions per team (should be configurable from 1 to 3; start with 2)
// length of judging sessions (should be configurable, start with 15 minutes)
// time between judging sessions (should be configurable; start with 10 minutes)

// import { replaceDuplicates } from "./JRcrossover";

function randomJS() {
  //NOTE: make numTeams a param later then need to change jrGrading method
  let teamsR = [];
  let teamsP = [];
  let judgingSeshs = 2;
  let numTeams = 32;
  let offsetT = 5;
  let lunchBreak = 45;
  for (let i = 1; i < numTeams + 1; i++) {
    let str1 = { id: i, name: "team" + i, startT: 0, duration: 25 }; // 15 minute actual duration + 10 minute break
    teamsR.push(str1);
    let str2 = { id: i, name: "team" + i, startT: 0, duration: 25 };
    teamsP.push(str2);
  }

  function getRandomNum() {
    return Math.floor(Math.random() * teamsR.length); // doesnt matter if its teamsR or teamsP because they are the same length
  }

  let judgingRoomsRobot = 4;
  let judgingRoomsProj = 4;
  let robotRooms = [];
  let projectRooms = [];

  for (let i = 0; i < judgingRoomsRobot; i++) {
    robotRooms.push([]);
  }
  for (let i = 0; i < judgingRoomsProj; i++) {
    projectRooms.push([]);
  }

  function checkDuplicates(timeSlot) {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (projectRooms[i][timeSlot].name === robotRooms[j][timeSlot].name) {
          let rand = Math.floor(Math.random() * (timeSlot + 1));
          const teamSwap = robotRooms[j][timeSlot];
          //need to check index for conflicts
          for (let r = 0; r < robotRooms.length; r++) {
            if (robotRooms[r][rand].name === teamSwap.name) {
              rand = Math.floor(Math.random() * (timeSlot + 1));
            }
          }
          for (let r = 0; r < projectRooms.length; r++) {
            if (projectRooms[r][rand].name === teamSwap.name) {
              rand = Math.floor(Math.random() * (timeSlot + 1));
            }
          }
          robotRooms[j][timeSlot] = robotRooms[0][rand];
          robotRooms[0][rand] = teamSwap;
        }
      }
    }
  }
  function checkIndex(timeSlot) {
    let pr = -1;
    for (let i = 0; i < robotRooms.length; i++) {
      for (let j = 0; j < timeSlot; j++) {
        //CHECK IF THIS ACTUALLY WORKS
        for (let room = 0; room < projectRooms.length; room++) {
          if (
            projectRooms[room].some((e) => e.name === robotRooms[i][j].name)
          ) {
            pr = projectRooms[room].findIndex(
              (e) => e.name == robotRooms[i][j].name
            );
          }
        }
        if (pr != -1 && Math.abs(pr - j) === 1) {
          let rand = Math.floor(Math.random() * (timeSlot + 1));
          while (Math.abs(rand - j) === 1) {
            rand = Math.floor(Math.random() * (timeSlot + 1));
          }
          let teamSwap = robotRooms[i][j];
          robotRooms[i][j] = robotRooms[0][rand];
          robotRooms[0][rand] = teamSwap;
        }
      }
    }
  }

  let timeSlot = 0;
  let count = 0;
  while (teamsR.length > 0 || teamsP.length > 0) {
    for (let i = 0; i < robotRooms.length; i++) {
      let randomNum = getRandomNum();
      let team = teamsR[randomNum];
      robotRooms[i].push(team);
      teamsR.splice(randomNum, 1);
    }
    for (let i = 0; i < projectRooms.length; i++) {
      let randomNum = getRandomNum();
      let team = teamsP[randomNum];
      projectRooms[i].push(team);
      count++;
      teamsP.splice(randomNum, 1);
    }
    timeSlot++;
    checkDuplicates(timeSlot - 1);
    if (timeSlot > 3) {
      checkIndex(timeSlot - 1);
    }
  }

  for (let i = 0; i < robotRooms.length; i++) {
    for (let j = 0; j < robotRooms[i].length; j++) {
      robotRooms[i][j].startT = offsetT * i + robotRooms[i][j].duration * j;
      if (robotRooms[i][j].startT >= 135) {
        // lunch start is 150, 135 is 150-15(the duration of the session)
        robotRooms[i][j].startT += lunchBreak;
      }
    }
  }
  for (let i = 0; i < projectRooms.length; i++) {
    for (let j = 0; j < projectRooms[i].length; j++) {
      projectRooms[i][j].startT = offsetT * i + projectRooms[i][j].duration * j;
      if (projectRooms[i][j].startT >= 135) {
        projectRooms[i][j].startT += lunchBreak;
      }
    }
  }

  let rooms = robotRooms.concat(projectRooms);
  return rooms;
}

// console.log(randomJS());

// let js = randomJS();
// console.log("random JS:");
// console.log(js);

// console.log("random JS formatted: ");
// for (let i = 0; i < 4; i++) {
//   console.log(
//     `Robot Room ${i + 1}: ${js[i].map((team) => team.name).join(", ")}`
//   );
// }
// for (let i = 0; i < 4; i++) {
//   console.log(
//     `Project Room ${i + 1}: ${js[i + 4].map((team) => team.name).join(", ")}`
//   );
// }

export { randomJS };
//export { checkDuplicates };
