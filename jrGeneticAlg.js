import { jrGrading } from "./JRGrading.js";
import { randomJS } from "./randomJudgingSesh.js";
import { crossover } from "./JRcrossover.js";
import { getRandomNumX1 } from "./JRcrossover.js";
import { getRandomNumX2 } from "./JRcrossover.js";

let newPool = [];
let oldPool = [];

for (let i = 0; i < 100; i++) {
  let temp = randomJS();
  oldPool.push(temp);
}

//console.log("Old Pool: " + oldPool.length);

function performGeneticAlg() {
  oldPool.sort((a, b) => {
    return jrGrading(b) - jrGrading(a);
  });
  console.log("Old Pool: " + oldPool);
  let ParentA = oldPool[Math.floor(Math.random() * (oldPool.length / 2))];
  let ParentB = oldPool[Math.floor(Math.random() * (oldPool.length / 2))];

  console.log("Parent A: " + ParentA);
  console.log("Parent B: " + ParentB);

  let x1 = getRandomNumX1(ParentA);
  let x2 = getRandomNumX2(ParentB);

  let children = crossover(x1, x2, ParentA, ParentB);

  console.log("Children: " + children);

  let childA = children[0];
  let childB = children[1];

  newPool.push(childA);
  newPool.push(childB);

  console.log("New Pool: " + newPool);
}

performGeneticAlg();
