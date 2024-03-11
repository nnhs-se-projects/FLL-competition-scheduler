import { randomTable } from "./randomTable.js";
import { gradeTables } from "./tableGrading.js";

const POPULATION = 100;
const TOTAL_GENERATIONS = 10;

function run() {
  let newPool = [];
  let oldPool = [];
  let best = null;

  // create an initial random population of tours
  for (let i = 0; i < POPULATION; i++) {
    let parent = randomTable();
    while (parent === null) {
      parent = randomTable();
    }
    oldPool.push(parent);
  }
  // console.log("oldPool: ", oldPool);
  // EVALUATE INITIAL POOLS

  // iterate for the specific number of generations
  for (let i = 0; i < TOTAL_GENERATIONS; i++) {
    console.log("generation", i);
    best; // set best to the current best tour

    for (let j = 0; j < POPULATION / 2; j++) {
      let children = [];
      children = performGeneticAlgorithm(oldPool);
      newPool.push(children[0]);
      newPool.push(children[1]);
    }
    oldPool = newPool;
    newPool = [];
    // console.log("oldPool: ", oldPool);

    // sort old pool
    let grade = gradeTables(oldPool, POPULATION);
    for (let i = 0; i < grade.length; i++) {
      if (grade[i] > 0) {
        console.log("yay");
        console.log(grade[i]);
      }
    }
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
  const duplicates = [];
  const missing = [];
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
    loops2++;
    if (loops2 > 100) {
      return null;
    }
    const rand = Math.floor(Math.random() * (x2 - x1) + x1);
    const temp = child[tableNum][rand];
    if (
      child[0][rand].name !== missing[0].name &&
      child[1][rand].name !== missing[0].name &&
      child[2][rand].name !== missing[0].name &&
      child[3][rand].name !== missing[0].name
    ) {
      child[tableNum][rand] = missing[0];
      missing[0] = temp;
    }
  }

  const length = duplicates.length;

  if (length < 5) {
    for (let i = 0; i < length; i++) {
      const index = duplicates[i][1];
      if (
        missing[0].name !== child[0][index].name &&
        missing[0].name !== child[1][index].name &&
        missing[0].name !== child[2][index].name &&
        missing[0].name !== child[3][index].name
      ) {
        child[duplicates[i][0]][duplicates[i][1]] = missing[i];
        missing.splice(i, 1);
      } else {
        swap(duplicates[i][0]);
        i--;
        continue;
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
    console.log("first time");
    for (let i = length - 4; i < length; i++) {
      const index = duplicates[i][1];
      console.log("missing", missing);
      if (
        missing[0].name !== child[0][index].name &&
        missing[0].name !== child[1][index].name &&
        missing[0].name !== child[2][index].name &&
        missing[0].name !== child[3][index].name
      ) {
        child[duplicates[i][0]][duplicates[i][1]] = missing[0];
        missing.splice(0, 1);
      } else {
        swap(duplicates[i][0]);
        i--;
        continue;
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
