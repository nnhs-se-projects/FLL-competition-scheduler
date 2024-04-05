// import { json } from "express";
import { randomJS } from "./judgingRooms/randomJudgingSesh.js";
import { crossover } from "./judgingRooms/JRcrossover.js";
import { getRandomNumX1 } from "./judgingRooms/JRcrossover.js";
import { getRandomNumX2 } from "./judgingRooms/JRcrossover.js";
import { jrGrading } from "./judgingRooms/JRGrading.js";

//console.log("test");
let parentA = randomJS();
let parentB = randomJS();
// console.log(parentA);
// console.log(parentB);d

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

console.log("Parent A Score: ");
console.log(jrGrading(parentA));
console.log("Parent B Score: ");
console.log(jrGrading(parentB));
console.log("Child A Score: ");
console.log(jrGrading(children[0]));
console.log("Child B Score: ");
console.log(jrGrading(children[1]));
