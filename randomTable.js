let teams = [];

for (let i = 0; i < 3; i++) {
  for (let i = 1; i < 33; i++) {
    let str = "Team " + i;
    teams.push(str);
  }
}

function getRandomNum() {
  return Math.floor(Math.random() * teams.length);
}

let table1 = [];
let table2 = [];
let table3 = [];
let table4 = [];

let randomNum = getRandom();
teams[randomNum];
