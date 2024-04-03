import { randomTable } from "./newRandomTables.js";
import { gradeTables } from "./tableGrading.js";
import { test } from "./test.js";
import { tableTest } from "./tableTest.js";

const POPULATION = 100;
const TOTAL_GENERATIONS = 100;

function run() {
  let newPool = [];
  let oldPool = [];
  let best = null;

  // create an initial random population of tours
  for (let i = 0; i < POPULATION; i++) {
    let parent = randomTable();
    let testResult = test(parent);
    let tableTester = tableTest(parent, 1);
    while (
      parent === null ||
      testResult.includes("Failures") ||
      tableTester.includes("Failure")
    ) {
      parent = randomTable();
    }
    oldPool.push(parent);
  }
  // EVALUATE INITIAL POOLS

  // iterate for the specific number of generations
  for (let i = 0; i < TOTAL_GENERATIONS; i++) {
    console.log("generation", i);
    best; // set best to the current best tour

    for (let j = 0; j < POPULATION / 2; j++) {
      let children = [];
      children = performGeneticAlgorithm(oldPool);
      let test1 = test(children[0]);
      let test2 = test(children[1]);
      if (test1 == "Failures" || test2 == "Failures") {
        j--;
        continue;
      } else {
        newPool.push(children[0]);
        newPool.push(children[1]);
      }
    }
    oldPool = newPool;
    newPool = [];
    // sort old pool
    let grade = gradeTables(oldPool, POPULATION);

    let temp = [];
    for (let i = 132; i > -100; i--) {
      for (let j = 0; j < grade.length; j++) {
        if (grade[j] === i) {
          temp.push(oldPool[j]);
        }
      }
    }

    oldPool = temp;
    let newGrade = gradeTables(oldPool, POPULATION);
    console.log("newGrade: ", newGrade);
  }

  // SORT OLD POOL
}

function performGeneticAlgorithm(oldPool) {
  let parentA = oldPool[Math.floor(Math.random() * (oldPool.length / 2))];
  let parentB = oldPool[Math.floor(Math.random() * (oldPool.length / 2))];

  // STEP 2: CROSSOVER
  // get the children
  let children = crossOver(parentA, parentB);
  while (children[0] == null || children[1] == null) {
    children = crossOver(parentA, parentB);
  }

  // STEP 3: MUTATION
  let childA = mutate(children[0]);
  let childB = mutate(children[1]);

  // STEP 4: ADD TO NEW POOL
  children = [childA, childB];
  return children;
}
function crossOver(parentA, parentB) {
  let children = [];
  let c1t1 = [];
  let c1t2 = [];
  let c1t3 = [];
  let c1t4 = [];
  let c2t1 = [];
  let c2t2 = [];
  let c2t3 = [];
  let c2t4 = [];
  let x1 = Math.floor((Math.random() * parentA[0].length) / 2 + 1);
  let x2 = Math.floor(Math.random() * (parentA[0].length / 2) + x1 + 1);
  if (x2 - x1 < 5) {
    if (parentA[0].length - x2 > 4) {
      x2 += 4;
    } else if (x1 > 4) {
      x1 = -4;
    }
  }

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

  let child1 = [c1t1, c1t2, c1t3, c1t4];
  let child2 = [c2t1, c2t2, c2t3, c2t4];
  let rChild1 = replaceDuplicates(child1, x1, x2);
  let rChild2 = replaceDuplicates(child2, x1, x2);
  return [rChild1, rChild2];
}

function replaceDuplicates(child, x1, x2) {
  let duplicates = [];
  let missing = [];
  let loops = 0;
  let loops2 = 0;
  for (let t = 1; t < 33; t++) {
    let temp = [];
    for (let i = 0; i < child.length; i++) {
      for (let j = 0; j < child[i].length; j++) {
        if (child[i][j].name === "team" + t) {
          let arr = [i, j, child[i][j]];
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
      const str = { name: "team" + t, run: 3 };
      missing.push(str);
    }
  }

  function swap(tableNum) {
    while (loops2 < 100) {
      loops2++;
      const rand = Math.floor(Math.random() * (x2 - x1) + x1);
      const temp = child[tableNum][rand];
      if (
        missing.length > 0 &&
        child[0][rand].name !== missing[0].name &&
        child[1][rand].name !== missing[0].name &&
        child[2][rand].name !== missing[0].name &&
        child[3][rand].name !== missing[0].name
      ) {
        child[tableNum][rand] = missing[0];
        missing[0] = temp;
        return "done";
      } else if (x1 > 1 && x2 < 30) {
        if (
          child[0][rand].name !== temp.name &&
          child[1][rand].name !== temp.name &&
          child[2][rand].name !== temp.name &&
          child[3][rand].name !== temp.name &&
          child[0][rand - 1].name !== temp.name &&
          child[1][rand - 1].name !== temp.name &&
          child[2][rand - 1].name !== temp.name &&
          child[3][rand - 1].name !== temp.name &&
          child[0][rand + 1].name !== temp.name &&
          child[1][rand + 1].name !== temp.name &&
          child[2][rand + 1].name !== temp.name &&
          child[3][rand + 1].name !== temp.name
        ) {
          child[tableNum][rand] = missing[0];
          missing[0] = temp;
          return "done";
        }
      }
    }
    if (loops2 === 100) {
      return null;
    }
  }

  let length = duplicates.length;

  if (length < 5) {
    if (
      duplicates.length === 2 &&
      duplicates[0][2].run === duplicates[1][2].run
    ) {
      duplicates.splice(0, 1);
      length = duplicates.length;
    }
    for (let i = 0; i < length; i++) {
      const index = duplicates[i][1];
      try {
        if (
          missing.length > 0 &&
          x1 > 1 &&
          x2 < 30 &&
          missing[0].name !== child[0][index].name &&
          missing[0].name !== child[1][index].name &&
          missing[0].name !== child[2][index].name &&
          missing[0].name !== child[3][index].name &&
          missing[0].name !== child[0][index - 1].name &&
          missing[0].name !== child[1][index - 1].name &&
          missing[0].name !== child[2][index - 1].name &&
          missing[0].name !== child[3][index - 1].name &&
          missing[0].name !== child[0][index + 1].name &&
          missing[0].name !== child[1][index + 1].name &&
          missing[0].name !== child[2][index + 1].name &&
          missing[0].name !== child[3][index + 1].name
        ) {
          child[duplicates[i][0]][duplicates[i][1]] = missing[0];
          missing.splice(0, 1);
        } else if (
          missing.length > 0 &&
          missing[0].name !== child[0][index].name &&
          missing[0].name !== child[1][index].name &&
          missing[0].name !== child[2][index].name &&
          missing[0].name !== child[3][index].name
        ) {
          child[duplicates[i][0]][duplicates[i][1]] = missing[0];
          missing.splice(0, 1);
        } else {
          let swapResult = swap(duplicates[i][0]);
          if (swapResult === "done") {
            i--;
            continue;
          } else if (swapResult === null) {
            return null;
          }
        }
      } catch (e) {
        console.log("error", e);
        console.log("index", index);
        console.log("child[0]", child[0]);
      }
    }
  } else {
    for (let i = 0; i < length - 4; i++) {
      if (loops > 100) {
        return null;
      }
      let rand = Math.floor(Math.random() * missing.length);
      const index = duplicates[i][1];
      if (
        missing[rand].name !== undefined &&
        missing[rand].name !== child[0][index].name &&
        missing[rand].name !== child[1][index].name &&
        missing[rand].name !== child[2][index].name &&
        missing[rand].name !== child[3][index].name
      ) {
        child[duplicates[i][0]][duplicates[i][1]] = missing[rand];
        missing.splice(rand, 1);
      } else {
        loops++;
        i--;
        continue;
      }
    }
    if (missing.length <= 3) {
      return null;
    }
    for (let i = length - 4; i < length; i++) {
      const index = duplicates[i][1];
      if (
        missing.length > 0 &&
        missing[0].name !== child[0][index].name &&
        missing[0].name !== child[1][index].name &&
        missing[0].name !== child[2][index].name &&
        missing[0].name !== child[3][index].name
      ) {
        child[duplicates[i][0]][duplicates[i][1]] = missing[0];
        missing.splice(0, 1);
      } else {
        let swapResult = swap(duplicates[i][0]);
        if (swapResult === "done") {
          i--;
          continue;
        } else if (swapResult === null) {
          return null;
        }
      }
    }
  }
  return child;
}

for (let i = 0; i < 1; i++) {
  console.log("run", i + 1);
  run();
}

function mutate(crossoverChildren) {
  let randomNum = Math.floor(Math.random() * 10 + 1);
  if (randomNum === 1) {
    return swapRandTwo(crossoverChildren);
    //update rating
  } else {
    return crossoverChildren;
  }
}

function swapRandTwo(child) {
  for (let i = 0; i < 4; i++) {
    let rand1 = Math.floor(Math.random() * child[i].length);
    let rand2 = Math.floor(Math.random() * child[i].length);
    let teamSwap = child[i][rand1];
    child[i][rand1] = child[i][rand2];
    child[i][rand2] = teamSwap;
  }
  return child;
}
