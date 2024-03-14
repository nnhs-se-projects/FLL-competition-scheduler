import { jrGrading } from "./JRGrading.js";
import { randomJS } from "./randomJudgingSesh.js";
import { crossover } from "./JRcrossover.js";
import { getRandomNumX1 } from "./JRcrossover.js";
import { getRandomNumX2 } from "./JRcrossover.js";

let newPool = [];
let oldPool = [];

for (let i = 0; i < 100; i++) {
  let temp = randomJS();
  while (jrGrading(temp) < 0.9) {
    temp = randomJS();
  }
  oldPool.push(temp);
}

//console.log("Old Pool: " + oldPool.length);

function performGeneticAlg() {
  oldPool.sort((a, b) => {
    return jrGrading(b) - jrGrading(a);
  });

  console.log("SCORES: ");
  for (let i = 0; i < oldPool.length; i++) {
    console.log(jrGrading(oldPool[i]));
  }

  //console.log("Old Pool: " + oldPool);
  let ParentA = oldPool[Math.floor(Math.random() * (oldPool.length / 2))];
  let ParentB = oldPool[Math.floor(Math.random() * (oldPool.length / 2))];

  // console.log("Parent A: " + ParentA);
  // console.log("Parent B: " + ParentB);

  let x1 = getRandomNumX1(ParentA);
  let x2 = getRandomNumX2(ParentB);

  let children = crossover(x1, x2, ParentA, ParentB);

  // console.log("Children: " + children);

  let childA = children[0];
  let childB = children[1];

  while (jrGrading(childA) < 0.9 || jrGrading(childB) < 0.9) {
    let x1 = getRandomNumX1(ParentA);
    let x2 = getRandomNumX2(ParentB);
    let children = crossover(x1, x2, ParentA, ParentB);
    childA = children[0];
    childB = children[1];
  }

  newPool.push(childA);
  newPool.push(childB);

  // console.log("New Pool: " + newPool);
}

console.log("Old Pool: " + oldPool);

// for (let i = 0; i < 25; i++) {
//   performGeneticAlg();
// }
// console.log("New Pool: " + newPool);

// oldPool = newPool;
// newPool = [];

let runs = 25;
while (oldPool.length > 4) {
  for (let i = 0; i < runs; i++) {
    performGeneticAlg();
  }
  runs = runs / 2;
  console.log("New Pool: " + newPool);
  oldPool = newPool;
  newPool = [];
}

oldPool.sort((a, b) => {
  return jrGrading(b) - jrGrading(a);
});

console.log("Best Judging Schedule: ");
console.log(jrGrading(oldPool[0]));
for (let j = 0; j < oldPool[0].length; j++) {
  if (j < oldPool[0].length / 2) {
    console.log("Robot Room " + (j + 1) + ": " + oldPool[0][j]);
  } else {
    console.log("Project Room " + (j + 1) + ": " + oldPool[0][j]);
  }
}
