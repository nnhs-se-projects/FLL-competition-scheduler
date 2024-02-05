function randomTable() {
  let teams = [];
  let table1 = [];
  let table2 = [];
  let table3 = [];
  let table4 = [];
  for (let j = 0; j < 3; j++) {
    for (let i = 1; i < 33; i++) {
      let str = { name: "team" + i, run: j + 1 };
      teams.push(str);
    }
  }
  let length = teams.length;
  function getRandomTeam() {
    let randomTeam = Math.floor(Math.random() * teams.length);
    return teams[randomTeam];
  }
  let count = 1;
  for (let i = 0; i < length - 4; i++) {
    let team = getRandomTeam();
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
          const rand = Math.floor(Math.random() * table1.length);
          const teamSwap = teams[j];
          teams[j] = table1[rand];
          table1[rand] = teamSwap;
        }
      }
    }
  }

  for (let i = 0; i < 4; i++) {
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

  let tables = [table1, table2, table3, table4];
  return tables;

  //console.log(teams);
  //console.log("table 1: " + table1);
  //console.log("table 2: " + table2);
  //console.log("table 3: " + table3);
  //console.log("table 4: " + table4);
}
export { randomTable };
