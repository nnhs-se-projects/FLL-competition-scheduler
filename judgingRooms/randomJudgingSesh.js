// number of teams (must be configurable)
// number of judging rooms (should be configurable; start with 8)
// number of judging sessions per team (should be configurable from 1 to 3; start with 2)
// length of judging sessions (should be configurable, start with 15 minutes)
// time between judging sessions (should be configurable; start with 10 minutes)

// import { replaceDuplicates } from "./JRcrossover";

function randomJS(teamNames = [], numTeams = 32, numJudgingRooms = 8) {
  console.log(
    `randomJS: Creating judging schedule for ${numTeams} teams and ${numJudgingRooms} rooms`
  );

  const teamsR = [];
  const teamsP = [];
  // const judgingSeshs = 2; // Not used
  const offsetT = 5;
  // const lunchBreak = 45; // Not used
  const ROOM_TIME_INCREMENT = 25; // 15 minute actual duration + 10 minute break

  for (let i = 1; i <= numTeams; i++) {
    const teamName = teamNames[i - 1] || `team${i}`;
    const str1 = {
      id: i,
      name: teamName,
      startT: 0,
      duration: 15,
      type: "robot",
    };
    teamsR.push(str1);
    const str2 = {
      id: i,
      name: teamName,
      startT: 0,
      duration: 15,
      type: "project",
    };
    teamsP.push(str2);
  }
  console.log(
    `Created ${teamsR.length} robot judging entries and ${teamsP.length} project judging entries`
  );

  function getRandomNum() {
    return Math.floor(Math.random() * teamsR.length);
  }

  // Split judging rooms between robot and project
  const judgingRoomsRobot = Math.floor(numJudgingRooms / 2);
  const judgingRoomsProj = numJudgingRooms - judgingRoomsRobot;
  console.log(
    `Split judging rooms: ${judgingRoomsRobot} robot rooms and ${judgingRoomsProj} project rooms`
  );

  const robotRooms = [];
  const projectRooms = [];

  for (let i = 0; i < judgingRoomsRobot; i++) {
    robotRooms.push([]);
  }
  for (let i = 0; i < judgingRoomsProj; i++) {
    projectRooms.push([]);
  }
  console.log("Initialized judging room arrays");

  // Assign teams to robot judging rooms
  console.log("Assigning teams to robot judging rooms...");
  for (let i = 0; i < judgingRoomsRobot; i++) {
    console.log(`Assigning teams to robot room ${i + 1}...`);
    const teamsPerRoom = Math.ceil(numTeams / judgingRoomsRobot);
    console.log(
      `Planning to assign up to ${teamsPerRoom} teams per robot room`
    );

    for (let j = 0; j < teamsPerRoom; j++) {
      if (teamsR.length === 0) {
        console.log("No more teams available for robot judging");
        break;
      }

      const randomNum = getRandomNum();
      if (randomNum >= teamsR.length) {
        console.log(
          `Warning: Invalid random index ${randomNum} for array of length ${teamsR.length}`
        );
        continue;
      }

      teamsR[randomNum].startT = j * ROOM_TIME_INCREMENT + offsetT;
      teamsR[randomNum].type = "robot";

      robotRooms[i].push(teamsR[randomNum]);
      teamsR.splice(randomNum, 1);
    }
    console.log(
      `Assigned ${robotRooms[i].length} teams to robot room ${i + 1}`
    );
  }

  // Assign teams to project judging rooms
  console.log("Assigning teams to project judging rooms...");
  for (let i = 0; i < judgingRoomsProj; i++) {
    console.log(`Assigning teams to project room ${i + 1}...`);
    const teamsPerRoom = Math.ceil(numTeams / judgingRoomsProj);
    console.log(
      `Planning to assign up to ${teamsPerRoom} teams per project room`
    );

    for (let j = 0; j < teamsPerRoom; j++) {
      if (teamsP.length === 0) {
        console.log("No more teams available for project judging");
        break;
      }

      const randomNum = getRandomNum();
      if (randomNum >= teamsP.length) {
        console.log(
          `Warning: Invalid random index ${randomNum} for array of length ${teamsP.length}`
        );
        continue;
      }

      teamsP[randomNum].startT = j * ROOM_TIME_INCREMENT + offsetT;
      teamsP[randomNum].type = "project";

      projectRooms[i].push(teamsP[randomNum]);
      teamsP.splice(randomNum, 1);
    }
    console.log(
      `Assigned ${projectRooms[i].length} teams to project room ${i + 1}`
    );
  }

  // Combine robot and project rooms
  const js = [];
  for (let i = 0; i < judgingRoomsRobot; i++) {
    js.push(robotRooms[i]);
  }
  for (let i = 0; i < judgingRoomsProj; i++) {
    js.push(projectRooms[i]);
  }

  console.log(`Created combined judging schedule with ${js.length} rooms`);
  return js;
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

module.exports = { randomJS };
