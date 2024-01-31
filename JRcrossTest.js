// import { json } from "express";
// import { randomJS } from "./randomJudgingSesh.js";
// import { crossover } from "./JRcrossover.js";
const randomJS = require("./randomJudgingSesh.js");

let parentA = randomJS();
let parentB = randomJS();

function getRandomNum() {
  return Math.floor(Math.random() * parentA.length);
}

let x1 = getRandomNum();
let x2 = getRandomNum();

let children = crossover(x1, x2, parentA, parentB);
console.log(children);

console.log("Child A: ");
for (let i = 0; i < children.length / 2; i++) {
  if (i < children.length / 4) {
    console.log("Robot Room " + (i + 1) + ": " + children[i]);
  }
  console.log("Project Room " + (i + 1) + ": " + children[i]);
}

console.log("Child B: ");
for (let i = children.length / 2; i < children.length; i++) {
  if (i < children.length * (3 / 4)) {
    console.log("Robot Room " + (i + 1) + ": " + children[i]);
  }
  console.log("Project Room " + (i + 1) + ": " + children[i]);
}
