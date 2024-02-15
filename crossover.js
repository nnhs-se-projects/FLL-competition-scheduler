import { randomTable } from "./randomTable.js";

const POPULATION = 10;

const newPool = [];
const oldPool = [];

function crossOver(x1, x2, parentA, parentB) {
  let children = [];
  let c1t1 = [];
  let c1t2 = [];
  let c1t3 = [];
  let c1t4 = [];
  let c2t1 = [];
  let c2t2 = [];
  let c2t3 = [];
  let c2t4 = [];
  let loops = 0;

  for (let i = 0; i < x1; i++) {
    c1t1.push(parentA[0][i]); // crossing over child 1 table 1
    c1t2.push(parentA[1][i]); // crossing over child 1 table 2
    c1t3.push(parentA[2][i]); // crossing over child 1 table 3
    c1t4.push(parentA[3][i]); // crossing over child 1 table 4

    c2t1.push(parentB[0][i]); // crossing over child 2 table 1
    c2t2.push(parentB[1][i]); // crossing over child 2 table 2
    c2t3.push(parentB[2][i]); // crossing over child 2 table 3
    c2t4.push(parentB[3][i]); // crossing over child 2 table 4
  }
  for (let i = x1; i < x2; i++) {
    c1t1.push(parentB[0][i]);
    c1t2.push(parentB[1][i]);
    c1t3.push(parentB[2][i]);
    c1t4.push(parentB[3][i]);

    c2t1.push(parentA[0][i]);
    c2t2.push(parentA[1][i]);
    c2t3.push(parentA[2][i]);
    c2t4.push(parentA[3][i]);
  }
  for (let i = x2; i < parentA[0].length; i++) {
    c1t1.push(parentA[0][i]);
    c1t2.push(parentA[1][i]);
    c1t3.push(parentA[2][i]);
    c1t4.push(parentA[3][i]);

    c2t1.push(parentB[0][i]);
    c2t2.push(parentB[1][i]);
    c2t3.push(parentB[2][i]);
    c2t4.push(parentB[3][i]);
  }
  // console.log("parentA:", parentA);
  // console.log("parentB:", parentB);
  // console.log(
  //   "child1 table1:",
  //   c1t1,
  //   "table 2: ",
  //   c1t2,
  //   "table 3: ",
  //   c1t3,
  //   "table4: ",
  //   c1t4
  // );
  // console.log("x1: ", x1, "x2: ", x2);

  let child1 = [c1t1, c1t2, c1t3, c1t4];
  let child2 = [c2t1, c2t2, c2t3, c2t4];
  replaceDuplicates(child1, child2, x1, x2);
}

function geneticAlgorithm() {
  let parentA = randomTable();
  while (parentA === null) {
    // console.log("parent A check"); not here
    parentA = randomTable();
  }
  let parentB = randomTable();
  while (parentB === null) {
    // console.log("parent B check"); not here
    parentB = randomTable();
  }

  let x1 = Math.floor((Math.random() * parentA[0].length) / 2 + 1);
  let x2 = Math.floor(Math.random() * (parentA[0].length / 2) + x1 + 1);
  if (x2 - x1 < 5) {
    if (parentA[0].length - x2 > 4) {
      x2 += 4;
    } else if (x1 > 4) {
      x1 = -4;
    }
  }

  crossOver(x1, x2, parentA, parentB);
}

function replaceDuplicates(child1, child2, x1, x2) {
  const duplicates = [];
  const missing = [];
  for (let t = 1; t < 33; t++) {
    let temp = [];
    for (let i = 0; i < child1.length; i++) {
      //console.log("test 1");
      for (let j = 0; j < child1[i].length; j++) {
        // console.log("test 2"); ran for sooooo long I couldn't tell if it was loading or infinite
        if (child1[i][j].name === "team" + t) {
          // rare but occasionally the name is undefined
          //console.log("test 3");
          let arr = [i, j, child1[i][j]];
          temp.push(arr);
        }
      }
    }

    let run1 = 0;
    let run2 = 0;
    let run3 = 0;
    for (let i = 0; i < temp.length; i++) {
      if (temp[i][2].run === 1) {
        run1++;
      } else if (temp[i][2].run === 2) {
        run2++;
      } else if (temp[i][2].run === 3) {
        run3++;
      }
    }
    if (run1 > 1) {
      for (let k = 0; k < temp.length; k++) {
        if (temp[k][2].run === 1 && temp[k][1] >= x1 && temp[k][1] < x2) {
          duplicates.push(temp[k]);
        }
      }
    } else if (run1 < 1) {
      let str = { name: "team" + t, run: 1 };
      missing.push(str);
    }
    if (run2 > 1) {
      for (let j = 0; j < temp.length; j++) {
        if (temp[j][2].run === 2 && temp[j][1] >= x1 && temp[j][1] < x2) {
          duplicates.push(temp[j]);
        }
      }
    } else if (run2 < 1) {
      let str = { name: "team" + t, run: 2 };
      missing.push(str);
    }
    if (run3 > 1) {
      for (let i = 0; i < temp.length; i++) {
        if (temp[i][2].run === 3 && temp[i][1] >= x1 && temp[i][1] < x2) {
          duplicates.push(temp[i]);
        }
      }
    } else if (run3 < 1) {
      let str = { name: "team" + t, run: 3 };
      missing.push(str);
    }
  }

  const length = duplicates.length;
  for (let i = 0; i < length - 4; i++) {
    let rand = Math.floor(Math.random() * missing.length);
    const index = duplicates[i][1];
    if (
      missing[rand].name !== child1[0][index].name &&
      missing[rand].name !== child1[1][index].name &&
      missing[rand].name !== child1[2][index].name &&
      missing[rand].name !== child1[3][index].name
    ) {
      child1[duplicates[i][0]][duplicates[i][1]] = missing[rand];
      missing.splice(rand, 1);
    } else {
      i--;
      continue;
    }
  }

  function swap(tableNum) {
    let rand = Math.floor(Math.random() * (x2 - x1) + x1);
    const temp = child1[tableNum][rand];
    if (
      child1[0][rand].name !== missing[0].name &&
      child1[1][rand].name !== missing[0].name &&
      child1[2][rand].name !== missing[0].name &&
      child1[3][rand].name !== missing[0].name
    ) {
      if (
        child1[0][rand].name !== missing[0].name &&
        child1[1][rand].name !== missing[0].name &&
        child1[2][rand].name !== missing[0].name &&
        child1[3][rand].name !== missing[0].name
      ) {
        child1[tableNum][rand] = missing[0];
        missing[0] = temp;
      }
    }
  }

  for (let i = length - 4; i < length; i++) {
    const index = duplicates[i][1];
    if (
      missing[0].name !== child1[0][index].name &&
      missing[0].name !== child1[1][index].name &&
      missing[0].name !== child1[2][index].name &&
      missing[0].name !== child1[3][index].name
    ) {
      child1[duplicates[i][0]][duplicates[i][1]] = missing[0];
      missing.splice(0, 1);
    } else {
      swap(duplicates[i][0]);
      i--;
      continue;
    }
    // still is an infinite loop
  }
  console.log("child1: ", child1[0][0]);
}

for (let i = 0; i < 10000; i++) {
  console.log("run", i + 1);
  geneticAlgorithm();
}
