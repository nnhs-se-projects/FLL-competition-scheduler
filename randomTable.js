let teams = [];

let table1 = [];
let table2 = [];
let table3 = [];
let table4 = [];

for (let i = 1; i < 33; i++) {
  let arr = [];
  arr.push(-1);
  arr.push("Team " + i);
  arr.push("Team " + i);
  arr.push("Team " + i);
  teams.push(arr);
}

let length = teams.length * 3;

function getRandomTeam() {
  let randomTeam = Math.floor(Math.random() * teams.length);
  return teams[randomTeam];
}

let count = 1;

for (let i = 0; i < length; i++) {
  let team = getRandomTeam();
  let index = teams.indexOf(team);
  if (count === 1) {
    if (table1.length - team[0] > 2 || team[0] === -1) {
      table1.push(team.pop());
      teams[index][0] = table1.length - 1;
      count++;
    } else {
      i--;
      continue;
    }
  } else if (count === 2) {
    if (team != table1[table1.length - 1]) {
      if (table2.length - team[0] > 2 || team[0] === -1) {
        table2.push(team.pop());
        teams[index][0] = table2.length - 1;
        count++;
      }
    } else {
      i--;
      continue;
    }
  } else if (count === 3) {
    if (
      team != table1[table1.length - 1] &&
      team != table2[table2.length - 1]
    ) {
      if (table3.length - team[0] > 2 || team[0] === -1) {
        table3.push(team.pop());
        teams[index][0] = table3.length - 1;
        count++;
      }
    } else {
      i--;
      continue;
    }
  } else if (count === 4) {
    if (
      team != table1[table1.length - 1] &&
      team != table2[table2.length - 1] &&
      team != table3[table3.length - 1]
    ) {
      if (table4.length - team[0] > 2 || team[0] === -1) {
        table4.push(team.pop());
        teams[index][0] = table4.length - 1;
        count = 1;
      }
    } else {
      i--;
      continue;
    }
  }
  if (team.length === 1) {
    teams.splice(index, 1);
  }
}

console.log(teams);
console.log("table 1: " + table1);
console.log("table 2: " + table2);
console.log("table 3: " + table3);
console.log("table 4: " + table4);
