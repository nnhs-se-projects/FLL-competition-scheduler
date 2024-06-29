const { randRange } = require("./util.cjs");
const { crossover, mutate } = require("./geneticAlgorithm.cjs");
const { FLLSchedule } = require("./fllSchedule.cjs");

const POP_SIZE = 1000;
const TOTAL_GENERATIONS = 100;

let oldPool = new Array(POP_SIZE);
let newPool = new Array(POP_SIZE);
let newPoolIndex = 0;

// create an initial random population of genome
for (let i = 0; i < POP_SIZE; i++) {
  oldPool[i] = new FLLSchedule();
  oldPool[i].populateWithRandomGenes();
}

// display the best initial genome
oldPool.sort((a, b) => a.score - b.score);
console.log(
  "Initial best genome:" + oldPool[0].genes + " score: " + oldPool[0].score
);

// iterate for the specified number of generations
for (let i = 0; i < TOTAL_GENERATIONS; i++) {
  printTopOfPool(oldPool, "Gen: " + i, 5);

  // reset the index into the new pool
  newPoolIndex = 0;

  /*
   * repeatedly perform the genetic algorithm to populate the new pool
   *
   *  each invocation of performGeneticAlgorithm generates two child tours;
   *      therefore, invoke the method POP_SIZE / 2 times to create a new
   *      pool of size POP_SIZE
   */
  for (let j = 0; j < POP_SIZE / 2; j++) {
    performGeneticAlgorithm();
  }

  // swap the old and new pools
  const temp = oldPool;
  oldPool = newPool;
  newPool = temp;

  // sort the old pool
  oldPool.sort((a, b) => a.score - b.score);
}

console.log(oldPool[0].genes + " score: " + oldPool[0].score);

function printTopOfPool(pool, label, count) {
  console.log(label);
  for (let i = 0; i < count; i++) {
    console.log(i + ": " + pool[i].genes + " score: " + pool[i].score);
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

  // finally add the children to the new pool
  newPool[newPoolIndex++] = childA;
  newPool[newPoolIndex++] = childB;
}
