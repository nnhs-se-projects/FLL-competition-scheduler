// number of teams (must be configurable)
// number of judging rooms (should be configurable; start with 8)
// number of judging sessions per team (should be configurable from 1 to 3; start with 2)
// length of judging sessions (should be configurable, start with 15 minutes)
// time between judging sessions (should be configurable; start with 10 minutes)

// import { replaceDuplicates } from "./JRcrossover";

function randomJS() {
  let teamsR = [];
  let teamsP = [];
  let judgingSeshs = 2;
  let numTeams = 32;
  for (let i = 1; i < numTeams + 1; i++) {
    let str = " team" + i;
    teamsR.push(str);
    teamsP.push(str);
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

  function checkDuplicates() {
    for (let i = 0; i < 4; i++) {
      for (let j = 1; j < 4; j++) {
        if (robotRooms[i] === robotRooms[j]) {
          const rand = Math.floor(Math.random() * robotRooms[0].length);
          const teamSwap = robotRooms[j];
          robotRooms[j] = robotRooms[0][rand];
          robotRooms[0][rand] = teamSwap;
        }
      }
      for (let j = 0; j < 4; j++) {
        if (projectRooms[i] === robotRooms[j]) {
          const rand = Math.floor(Math.random() * robotRooms[0].length);
          const teamSwap = robotRooms[j];
          robotRooms[j] = robotRooms[0][rand];
          robotRooms[0][rand] = teamSwap;
        }
      }
    }
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (robotRooms[i] === projectRooms[j]) {
          const rand = Math.floor(Math.random() * robotRooms[0].length);
          const teamSwap = robotRooms[j];
          robotRooms[j] = robotRooms[0][rand];
          robotRooms[0][rand] = teamSwap;
        }
      }
      for (let j = 1; j < 4; j++) {
        if (projectRooms[i] === projectRooms[j]) {
          const rand = Math.floor(Math.random() * robotRooms[0].length);
          const teamSwap = robotRooms[j];
          robotRooms[j] = robotRooms[0][rand];
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
      // for (let j = 0; j < robotRooms.length; j++) {
      //   //  doesn't check the last room because it would be in an infinite loops

      //   // check if team is in a different judging room at the same time
      //   while (robotRooms[j][timeSlot] === team) {
      //     randomNum = getRandomNum();
      //     team = teamsP[randomNum];
      //     j = 0;
      //   }
      // }
      projectRooms[i].push(team);
      count++;
      console.log(count + "push");
      teamsP.splice(randomNum, 1);
    }
    timeSlot++;
    checkDuplicates();
  }

  let rooms = robotRooms.concat(projectRooms);
  return rooms;
}
export { randomJS };

// for (let i = 0; i < robotRooms.length; i++) {
//   console.log("Robot Room " + (i + 1) + ": " + robotRooms[i]);
// }
// for (let i = 0; i < projectRooms.length; i++) {
//   console.log("Project Room " + (i + 1) + ": " + projectRooms[i]);
// }
