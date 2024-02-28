import { randomTable } from "./randomTable.js";

const POPULATION = 100;

function run() {
  let newPool = [];
  let oldPool = [];
  let tmp_pool = [];
  let best = null;
  for (let i = 0; i < POPULATION; i++) {
    let parent = randomTable();
    while (parent === null) {
      console.log("parent change");
      parent = randomTable();
    }
    oldPool.push(parent);
  }
  console.log("run");
  performGeneticAlgorithm();
  // SORT POOLS
}

function performGeneticAlgorithm() {
  // console.log("performGeneticAlgorithm");
  let parentA = oldPool[Math.floor(Math.random() * (oldPool.length / 2))];
  let parentB = oldPool[Math.floor(Math.random() * (oldPool.length / 2))];

  // STEP 2: CROSSOVER
  // get the children
  let children = crossOver(parentA, parentB);
  while (children[0] == null || children[1] == null) {
    // change later to fit children[0] and children[1]
    console.log("crossover failed");
    children = crossOver(parentA, parentB);
  }

  // STEP 3: MUTATION
  let childA = mutate(children[0]);
  let childB = mutate(children[1]);

  // STEP 4: ADD TO NEW POOL
}
function crossOver(parentA, parentB) {
  // console.log("crossOver");
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
    // console.log("i1: ", i);
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
    // console.log("i2: ", i);
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
    // console.log("i3: ", i);
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
  let rChild1 = replaceDuplicates(child1, x1, x2);
  let rChild2 = replaceDuplicates(child2, x1, x2);
  return [rChild1, rChild2];
}

function replaceDuplicates(child, x1, x2) {
  // console.log("replaceDuplicates");
  const duplicates = [];
  const missing = [];
  let loops = 0;
  let loops2 = 0;
  for (let t = 1; t < 33; t++) {
    // console.log("t: ", t);
    let temp = [];
    for (let i = 0; i < child.length; i++) {
      //console.log("test 1");
      for (let j = 0; j < child[i].length; j++) {
        // console.log("test 2"); ran for sooooo long I couldn't tell if it was loading or infinite
        if (child[i][j].name === "team" + t) {
          // rare but occasionally the name is undefined. Always is when i = 3 and j = 23
          // There is a literal value of undefined in the array at that index.
          // console.log("test 3");
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
    // console.log("swap");
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
      // console.log("i: ", i);
      const index = duplicates[i][1];
      if (
        missing[i].name !== child[0][index].name &&
        missing[i].name !== child[1][index].name &&
        missing[i].name !== child[2][index].name &&
        missing[i].name !== child[3][index].name
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
      // console.log("test 1");
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
    for (let i = length - 4; i < length; i++) {
      const index = duplicates[i][1];
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
  // still is an infinite loop
  console.log("child: ", child);
  return child;
}

for (let i = 0; i < 100; i++) {
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
