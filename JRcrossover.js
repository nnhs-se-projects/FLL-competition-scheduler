// import { json } from "express";
// import { randomJS } from "./randomJudgingSesh.js";
const randomJS = require("./randomJudgingSesh.js");

const POPULATION = 10;

const newPool = [];
const oldPool = [];

let judgingRoomNum = 8;

// x1 and x2 are cross over points
function crossover(x1, x2, parentA, parentB) {
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
      childA[room].push[parentA[room][i]];
    }
  }
  // copy the 1st segment of parentB to the childB
  for (let room = 0; room < parentB.length; room++) {
    for (let i = 0; i < x1; i++) {
      childB[room].push[parentB[room][i]];
    }
  }

  // copy the middle section of parentA to child B
  for (let room = 0; room < parentA.length; room++) {
    for (let i = x1; i < x2; i++) {
      childB[room].push[parentA[room][i]];
    }
  }
  // copy the middle section of parentB to child A
  for (let room = 0; room < parentB.length; room++) {
    for (let i = x1; i < x2; i++) {
      childA[room].push[parentB[room][i]];
    }
  }

  // copy the last segment of parentA to childA
  for (let room = 0; room < parentA.length; room++) {
    for (let i = x2; i < parentA[room].length; i++) {
      childA[room].push[parentA[room][i]];
    }
  }
  // copy the last segment of parentB to childB
  for (let room = 0; room < parentB.length; room++) {
    for (let i = x2; i < parentB[room].length; i++) {
      childB[room].push[parentB[room][i]];
    }
  }

  // correct/get rid of duplicates, add teams that got lost in the crossover sections
  // look at the crossed over section and scan for teams A previously had but B didnt
  // switch the teams they didn't have in common
  for (let room = 0; room < parentA.length; room++) {
    for (let i = x1; i < x2; i++) {
      if (!childB[room].includes(childA[room][i])) {
        childB[room].push(childA[room][i]);
        childA[room].slice(i, 1);
      }
      if (!childA[room].includes(childB[room][i])) {
        childA[room].push(childB[room][i]);
        childB[room].slice(i, 1);
      }
    }
  }

  let children = childA.concat(childB);

  return children;

  // add the child to the new pool
}
module.exports = crossover;

// after everything, determine criteria for good child and give scores to the children
