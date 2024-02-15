// import { json } from "express";
import { randomJS } from "./randomJudgingSesh.js";
import { crossover } from "./JRcrossover.js";
import { getRandomNumX1 } from "./JRcrossover.js";
import { getRandomNumX2 } from "./JRcrossover.js";

//console.log("test");
let parentA = randomJS();
let parentB = randomJS();
// console.log(parentA);
// console.log(parentB);

let x1 = getRandomNumX1(parentA);
let x2 = getRandomNumX2(parentA);

console.log(x1, " ", x2);

let children = crossover(x1, x2, parentA, parentB);
//console.log("CHILDREN AFTER RD");

console.log("Child A: ");
for (let i = 0; i < children.length / 2; i++) {
  for (let j = 0; j < children[i].length; j++) {
    if (j < children[i].length / 2) {
      console.log("Robot Room " + (j + 1) + ": " + children[i][j]);
    } else {
      console.log("Project Room " + (j + 1) + ": " + children[i][j]);
    }
  }
}

console.log("Child B: ");
for (let i = children.length / 2; i < children.length; i++) {
  for (let j = 0; j < children[i].length; j++) {
    if (j < children[i].length / 2) {
      console.log("Robot Room " + (j + 1) + ": " + children[i][j]);
    } else {
      console.log("Project Room " + (j + 1) + ": " + children[i][j]);
    }
  }
}
