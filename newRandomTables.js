import { test } from "./test.js";
import { tableTest } from "./tableTest.js";
function randomTable() {
  let tables = [];
  let table1 = [];
  let table2 = [];
  let table3 = [];
  let table4 = [];

  let countLoops = 0;
  let countLoops2 = 0;
  for (let j = 0; j < 3; j++) {
    let teams = [];
    for (let i = 1; i < 33; i++) {
      let str = {
        name: "team" + i,
        run: j + 1,
        start: 0,
        duration: 10,
      };
      teams.push(str);
    }
    let length = teams.length;
    let count = 1;
    for (let i = 0; i < length - 4; i++) {
      if (countLoops2 > 200) {
        return null;
      }
      countLoops2++;
      let team = teams[Math.floor(Math.random() * teams.length)];
      let index = teams.indexOf(team);
      if (count === 1) {
        table1.push(team);
        count++;
      } else if (count === 2) {
        if (team.name != table1[table1.length - 1].name) {
          table2.push(team);
          count++;
        } else {
          i--;
          continue;
        }
      } else if (count === 3) {
        if (
          team.name != table1[table1.length - 1].name &&
          team.name != table2[table2.length - 1].name
        ) {
          table3.push(team);
          count++;
        } else {
          i--;
          continue;
        }
      } else if (count === 4) {
        if (
          team.name != table1[table1.length - 1].name &&
          team.name != table2[table2.length - 1].name &&
          team.name != table3[table3.length - 1].name
        ) {
          table4.push(team);
          count++;
          count = 1;
        } else {
          i--;
          continue;
        }
      }
      teams.splice(index, 1);
    }
    function checkDuplicate() {
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (teams[i].name === teams[j].name && i != j) {
            const rand = Math.floor(Math.random() * (table1.length - 1));
            if (
              table1[rand].name !== teams[j].name &&
              table2[rand].name !== teams[j].name &&
              table3[rand].name !== teams[j].name &&
              table4[rand].name !== teams[j].name
            ) {
              const teamSwap = teams[j];
              teams[j] = table1[rand];
              table1[rand] = teamSwap;
            }
          }
        }
      }
    }

    for (let i = 0; i < 4; i++) {
      countLoops++;
      if (countLoops > 40) {
        return null;
      }
      checkDuplicate();
      if (count === 1) {
        table1.push(teams[0]);
        count++;
      } else if (count === 2) {
        if (teams[1].name != table1[table1.length - 1].name) {
          table2.push(teams[1]);
          count++;
        } else {
          checkDuplicate();
          i--;
          continue;
        }
      } else if (count === 3) {
        if (
          teams[2].name != table1[table1.length - 1].name &&
          teams[2].name != table2[table2.length - 1].name
        ) {
          table3.push(teams[2]);
          count++;
        } else {
          checkDuplicate();
          i--;
          continue;
        }
      } else if (count === 4) {
        if (
          teams[3].name != table1[table1.length - 1].name &&
          teams[3].name != table2[table2.length - 1].name &&
          teams[3].name != table3[table3.length - 1].name
        ) {
          table4.push(teams[3]);
          count++;
          count = 1;
        } else {
          checkDuplicate();
          continue;
        }
      }
    }
  }
  for (let i = 0; i < table1.length; i++) {
    let int = i * 10;
    if (int > 140) {
      int = int + 50;
    }
    table1[i].start = int;
  }
  for (let i = 0; i < table2.length; i++) {
    let int = i * 10;
    if (int > 140) {
      int = int + 50;
    }
    table2[i].start = int;
  }
  for (let i = 0; i < table3.length; i++) {
    let int = i * 10 + 5;
    if (int > 140) {
      int = int + 50;
    }
    table3[i].start = int;
  }
  for (let i = 0; i < table4.length; i++) {
    let int = i * 10 + 5;
    if (int > 140) {
      int = int + 50;
    }
    table4[i].start = int;
  }

  tables.push(table1, table2, table3, table4);
  if (table4[23] == undefined) {
    return null;
  }
  let test1 = test(tables);
  if (test1.includes("Failures")) {
    console.log("failed in randomTable");
  }
  return tables;
}

let tables = randomTable();
let result1 = tableTest([tables], 1);
while (result1 == 0) {
  tables = randomTable();
  result1 = tableTest([tables], 1);
}
console.log(tables);
let str1 = "table 1: ";
let str2 = "table 2: ";
let str3 = "table 3: ";
let str4 = "table 4: ";
for (let i = 0; i < tables[0].length; i++) {
  var add = tables[0][i].name + ", ";
  str1 = str1.concat(add);
  str2 = str2.concat(tables[1][i].name + ", ");
  str3 = str3.concat(tables[2][i].name + ", ");
  str4 = str4.concat(tables[3][i].name + ", ");
}
console.log(str1);
console.log(str2);
console.log(str3);
console.log(str4);
export { randomTable };
