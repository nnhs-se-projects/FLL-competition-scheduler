import { randomJS } from "./randomJudgingSesh.js";
// const randomJS = require("./randomJudgingSesh.js");

const POPULATION = 10;

const newPool = [];
const oldPool = [];

function getRandomNumX1(parent) {
  return Math.floor(Math.random() * (parent[0].length / 2) + 1);
}

function getRandomNumX2(parent) {
  return Math.floor(
    Math.random() * (parent[0].length / 2 - 1) + parent[0].length / 2 + 1
  );
}

let judgingRoomNum = 8;

// x1 and x2 are cross over points
function crossover(x1, x2, parentA, parentB) {
  // make sure x1 is greater than x2 and by a min amount otherwise there is no crossover in the middle section
  const length = parentA.length;

  /// create empty children, array of empty JR arrays
  let childA = [];
  for (let i = 0; i < judgingRoomNum; i++) {
    childA.push([]);
  }
  let childB = [];

  for (let i = 0; i < judgingRoomNum; i++) {
    childB.push([]);
  }

  // copy the 1st segment of parentA to the childA
  for (let room = 0; room < parentA.length; room++) {
    for (let i = 0; i < x1; i++) {
      childA[room].push(parentA[room][i]); // Fix: Replace [] with ()
    }
  }
  //console.log("Child A: " + childA);
  // copy the 1st segment of parentB to the childB
  for (let room = 0; room < parentB.length; room++) {
    for (let i = 0; i < x1; i++) {
      childB[room].push(parentB[room][i]);
    }
  }

  // copy the middle section of parentA to child B
  for (let room = 0; room < parentA.length; room++) {
    for (let i = x1; i < x2; i++) {
      childB[room].push(parentA[room][i]);
    }
  }
  // copy the middle section of parentB to child A
  for (let room = 0; room < parentB.length; room++) {
    for (let i = x1; i < x2; i++) {
      childA[room].push(parentB[room][i]);
    }
  }

  // copy the last segment of parentA to childA
  for (let room = 0; room < parentA.length; room++) {
    for (let i = x2; i < parentA[room].length; i++) {
      childA[room].push(parentA[room][i]);
    }
  }
  // copy the last segment of parentB to childB
  for (let room = 0; room < parentB.length; room++) {
    for (let i = x2; i < parentB[room].length; i++) {
      childB[room].push(parentB[room][i]);
    }
  }

  // let children = [childA, childB];
  // console.log("Children BEFORE RD: ");
  // console.log("Child A: ");
  // for (let i = 0; i < children.length / 2; i++) {
  //   for (let j = 0; j < children[i].length; j++) {
  //     if (j < children[i].length / 2) {
  //       console.log("Robot Room " + (j + 1) + ": " + children[i][j]);
  //     } else {
  //       console.log("Project Room " + (j + 1) + ": " + children[i][j]);
  //     }
  //   }
  // }

  // console.log("Child B: ");
  // for (let i = children.length / 2; i < children.length; i++) {
  //   for (let j = 0; j < children[i].length; j++) {
  //     if (j < children[i].length / 2) {
  //       console.log("Robot Room " + (j + 1) + ": " + children[i][j]);
  //     } else {
  //       console.log("Project Room " + (j + 1) + ": " + children[i][j]);
  //     }
  //   }
  // }
  let children = replaceDuplicates(childA, childB, x1, x2);

  //console.log("Children: " + children);
  return children;

  // add the child to the new pool
}

function replaceDuplicates(childA, childB, x1, x2) {
  // correct/get rid of duplicates, add teams that got lost in the crossover sections
  // look at the crossed over section and scan for teams A previously had but B didn't
  // and vice versa
  // switch the teams they didn't have in common
  let constB = childB;
  for (let room = 0; room < childA.length; room++) {
    for (let a = x1; a < x2; a++) {
      if (!constB.includes(childA[room][a])) {
        for (let b = x1; b < x2; b++) {
          if (!childA.includes(childB[room][b])) {
            let swap = childA[room][a];
            childA[room][a] = childB[room][b];
            childB[room][b] = swap;
          }
        }
      }
    }
  }
  return [childA, childB];
}

export { replaceDuplicates };
export { crossover };
export { getRandomNumX1 };
export { getRandomNumX2 };
// after everything, determine criteria for good child and give scores to the children
