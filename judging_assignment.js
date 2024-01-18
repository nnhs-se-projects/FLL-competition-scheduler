// number of teams (must be configurable)
// number of judging rooms (should be configurable; start with 8)
// number of judging sessions per team (should be configurable from 1 to 3; start with 2)
// length of judging sessions (should be configurable, start with 15 minutes)
// time between judging sessions (should be configurable; start with 10 minutes)

let teamsN = [];

let judgingSeshs = 2;
let numTeams = 32;
for (let i = 0; i < judgingSeshs; i++) {
  for (let i = 1; i < numTeams + 1; i++) {
    let str = " team" + i;
    teamsN.push(str);
  }
}

function getRandomNum() {
  return Math.floor(Math.random() * teamsN.length);
}

let judgingRooms = 8;
let rooms = [];
for (let i = 0; i < judgingRooms; i++) {
  rooms.push([]);
}

while (teamsN.length > 0) {
  for (let i = 0; i < rooms.length; i++) {
    let randomNum = getRandomNum();
    let team = teamsN[randomNum];
    rooms[i].push(team);
    teamsN.splice(randomNum, 1);
  }
}

for (let i = 0; i < rooms.length; i++) {
  console.log("room " + (i + 1) + ": " + rooms[i]);
}
