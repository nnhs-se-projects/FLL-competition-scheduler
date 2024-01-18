let teams = [];

let table1 = [];
let table2 = [];
let table3 = [];
let table4 = [];

for (let i = 0; i < 3; i++) {
  for (let i = 1; i < 33; i++) {
    let str = "Team " + i;
    teams.push(str);
  }
}

let length = teams.length;

function getRandomTeam() {
  let randomTeam = Math.floor(Math.random() * teams.length);
  return teams[randomTeam];
}

let count = 1;
for (let i = 0; i < length; i++) {
  let team = getRandomTeam();
  let index = teams.indexOf(team);
  if (count === 1) {
    table1.push(team);
    count++;
  } else if (count === 2) {
    table2.push(team);
    count++;
  } else if (count === 3) {
    table3.push(team);
    count++;
  } else if (count === 4) {
    table4.push(team);
    count = 1;
  }
  teams.splice(index, 1);
}

console.log(teams);
console.log("table 1: " + table1);
console.log("table 2: " + table2);
console.log("table 3: " + table3);
console.log("table 4: " + table4);
