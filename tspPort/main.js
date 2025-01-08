import { randRange } from "./util.js";
import { crossover, mutate } from "./geneticAlgorithm.js";
import { FLLSchedule } from "./fllSchedule.js";

const POP_SIZE = 1000;
const TOTAL_GENERATIONS = 100;

let oldPool = new Array(POP_SIZE);
let newPool = new Array(POP_SIZE);
let newPoolIndex = 0;

// create an initial random population of genome
for (let i = 0; i < POP_SIZE; i++) {
  oldPool[i] = new FLLSchedule();
  oldPool[i].populateWithRandomGenes();
  console.log(i);
}

// display the best initial genome
oldPool.sort((a, b) => b.score - a.score);
console.log("Initial best genome score: " + oldPool[0].score);
oldPool[0].printSchedule();

// iterate for the specified number of generations
for (let i = 0; i < TOTAL_GENERATIONS; i++) {
  printTopOfPool(oldPool, "Gen: " + i, 5);

  // reset the index into the new pool
  newPoolIndex = 0;

  /*
   * repeatedly perform the genetic algorithm to populate the new pool
   *
   * we will keep the top 20% of the pool
   * since each invocation of performGeneticAlgorithm generates two child tours,
   *      invoke the method (POP_SIZE - POP_SIZE /5) / 2 times to create a new
   *      pool of size POP_SIZE
   */
  for (let j = 0; j < (POP_SIZE - POP_SIZE / 5) / 2; j++) {
    performGeneticAlgorithm();
  }

  /*
   * copy the top 20% of the old pool to the new pool
   * this is a strategy to ensure that the best schedules
   * are retained from one generation to the next
   */
  for (let j = 0; j < POP_SIZE / 5; j++) {
    newPool[newPoolIndex++] = oldPool[j];
  }

  // swap the old and new pools
  const temp = oldPool;
  oldPool = newPool;
  newPool = temp;

  // sort the old pool
  oldPool.sort((a, b) => b.score - a.score);
}

console.log("score: " + oldPool[0].score);
oldPool[0].printSchedule();

function printTopOfPool(pool, label, count) {
  console.log(label);
  for (let i = 0; i < count; i++) {
    console.log(i + ": score: " + pool[i].score);
  }
}

function performGeneticAlgorithm() {
  // STEP 1: SELECT two individuals to mate from the top half of the pool
  const parentA = oldPool[randRange(0, POP_SIZE / 2)];
  const parentB = oldPool[randRange(0, POP_SIZE / 2)];

  // STEP 2: CROSS-OVER
  // determine two cross-over points
  const x1 = randRange(0, parentA.getRange() - 2);
  const x2 = randRange(x1, parentA.getRange());

  // determine the children by first crossing parentA with parentB
  // and then crossing parentB with parentA
  const childA = crossover(parentA, parentB, x1, x2);
  const childB = crossover(parentB, parentA, x1, x2);

  // STEP 3: MUTATE the children
  mutate(childA);
  mutate(childB);

  childA.updateScore();
  childB.updateScore();

  // finally add the children to the new pool
  newPool[newPoolIndex++] = childA;
  newPool[newPoolIndex++] = childB;
}
