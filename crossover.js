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
  let parentB = randomTable();

  let x1 = Math.floor((Math.random() * parentA[0].length) / 2 + 1);
  let x2 = Math.floor(Math.random() * (parentA[0].length / 2) + x1 + 1);

  crossOver(x1, x2, parentA, parentB);
}

function replaceDuplicates(child1, child2, x1, x2) {
  let duplicates = [];
  for (let t = 1; t < 33; t++) {
    let temp = [];
    for (let i = 0; i < child1.length; i++) {
      for (let j = 0; j < child1[i].length; j++) {
        if (child1[i][j].name === "team" + t) {
          let arr = [i, j, child1[i][j]];
          temp.push(arr);
        }
      }
    }
    if (temp.length > 3) {
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
      console.log(temp, "run1: ", run1, "run2: ", run2, "run3: ", run3);
      console.log("x1: ", x1, "x2: ", x2);
      if (run1 > 1) {
        for (let k = 0; k < temp.length; k++) {
          if (temp[k][2].run === 1 && temp[k][1] >= x1 && temp[k][1] < x2) {
            duplicates.push(temp[k]);
          }
        }
      }
      if (run2 > 1) {
        for (let j = 0; j < temp.length; j++) {
          if (temp[j][2].run === 2 && temp[j][1] >= x1 && temp[j][1] < x2) {
            duplicates.push(temp[j]);
          }
        }
      }
      if (run3 > 1) {
        for (let i = 0; i < temp.length; i++) {
          if (temp[i][2].run === 3 && temp[i][1] >= x1 && temp[i][1] < x2) {
            duplicates.push(temp[i]);
          }
        }
      }
    }
  }

  console.log(duplicates);
}

geneticAlgorithm();
