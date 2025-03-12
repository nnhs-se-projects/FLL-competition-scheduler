/**
 * FLL Competition Scheduler - Genetic Algorithm
 *
 * This file contains the genetic algorithm implementation for optimizing FLL competition schedules.
 */

import CONFIG from "./config.js";
import { randRange } from "./utils.js";
import { evaluateSchedule } from "./scheduler.js";

/**
 * Swap two random events in a schedule
 * @param {Schedule} schedule - The schedule to modify
 */
function swapRandomEvents(schedule) {
  const a = randRange(0, schedule.getSize());
  const b = randRange(0, schedule.getSize());

  const temp = schedule.getEventAtIndex(a);
  schedule.replaceEventAtIndex(a, schedule.getEventAtIndex(b));
  schedule.replaceEventAtIndex(b, temp);
}

/**
 * Mutate a schedule by swapping random events
 * @param {Schedule} schedule - The schedule to mutate
 */
function mutate(schedule) {
  for (let i = 0; i < schedule.numberOfPotentialMutations; i++) {
    if (Math.random() < schedule.mutationProbability) {
      swapRandomEvents(schedule);
    }
  }

  // Re-evaluate the schedule after mutation
  schedule.score = evaluateSchedule(schedule);
}

/**
 * Create a child schedule by crossing over two parent schedules
 * @param {Schedule} parentA - The first parent schedule
 * @param {Schedule} parentB - The second parent schedule
 * @param {number} x1 - The start index of the crossover
 * @param {number} x2 - The end index of the crossover
 * @returns {Schedule} The child schedule
 */
function crossover(parentA, parentB, x1, x2) {
  const child = parentA.createCopy();

  child.replaceEventsInRange(0, x1, parentA.getEventsInRange(0, x1));
  child.replaceEventsInRange(x1, x2, parentB.getEventsInRange(x1, x2));
  child.replaceEventsInRange(
    x2,
    child.getSize(),
    parentA.getEventsInRange(x2, parentA.getSize())
  );

  replaceDuplicates(parentA, parentB, child, x1, x2);

  // Evaluate the child schedule
  child.score = evaluateSchedule(child);

  return child;
}

/**
 * Replace duplicate events in a child schedule
 * @param {Schedule} parentA - The first parent schedule
 * @param {Schedule} parentB - The second parent schedule
 * @param {Schedule} child - The child schedule
 * @param {number} x1 - The start index of the crossover
 * @param {number} x2 - The end index of the crossover
 */
function replaceDuplicates(parentA, parentB, child, x1, x2) {
  // Find events in parentA's crossover segment that don't appear in parentB's crossover segment
  const uniqueEvents = [];

  for (let i = x1; i < x2; i++) {
    let isDuplicate = false;
    const eventA = parentA.getEventAtIndex(i);

    for (let j = x1; j < x2; j++) {
      if (eventA.equals(parentB.getEventAtIndex(j))) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      uniqueEvents.push(eventA.copy());
    }
  }

  // Replace duplicates in the child's non-crossover segments
  let uniqueIndex = 0;

  // Check the first segment
  for (let i = 0; i < x1; i++) {
    const eventChild = child.getEventAtIndex(i);
    let isDuplicate = false;

    for (let j = x1; j < x2; j++) {
      if (eventChild.equals(child.getEventAtIndex(j))) {
        isDuplicate = true;
        break;
      }
    }

    if (isDuplicate && uniqueIndex < uniqueEvents.length) {
      child.replaceEventAtIndex(i, uniqueEvents[uniqueIndex]);
      uniqueIndex++;
    }
  }

  // Check the last segment
  for (let i = x2; i < child.getSize(); i++) {
    const eventChild = child.getEventAtIndex(i);
    let isDuplicate = false;

    for (let j = x1; j < x2; j++) {
      if (eventChild.equals(child.getEventAtIndex(j))) {
        isDuplicate = true;
        break;
      }
    }

    if (isDuplicate && uniqueIndex < uniqueEvents.length) {
      child.replaceEventAtIndex(i, uniqueEvents[uniqueIndex]);
      uniqueIndex++;
    }
  }
}

/**
 * Optimize a schedule using a genetic algorithm
 * @param {Schedule} initialSchedule - The initial schedule to optimize
 * @returns {Schedule} The optimized schedule
 */
function optimizeSchedule(initialSchedule) {
  const popSize = CONFIG.GENETIC.POPULATION_SIZE;
  const generations = CONFIG.GENETIC.GENERATIONS;
  const elitePercentage = CONFIG.GENETIC.ELITE_PERCENTAGE;

  // Create the initial population
  let oldPool = new Array(popSize);
  let newPool = new Array(popSize);

  // Initialize the first schedule
  oldPool[0] = initialSchedule;

  // Create variations of the initial schedule
  for (let i = 1; i < popSize; i++) {
    oldPool[i] = initialSchedule.createCopy();
    mutate(oldPool[i]);
  }

  // Sort the initial population by score
  oldPool.sort((a, b) => b.score - a.score);

  console.log(`Initial best schedule score: ${oldPool[0].score.toFixed(4)}`);

  // Evolve the population for the specified number of generations
  for (let generation = 0; generation < generations; generation++) {
    let newPoolIndex = 0;

    // Perform genetic algorithm operations to fill most of the new pool
    const crossoversToPerform = Math.floor(
      (popSize - popSize * elitePercentage) / 2
    );

    for (let i = 0; i < crossoversToPerform; i++) {
      // Select two parents from the top half of the pool
      const parentA = oldPool[randRange(0, Math.floor(popSize / 2))];
      const parentB = oldPool[randRange(0, Math.floor(popSize / 2))];

      // Determine crossover points
      const x1 = randRange(0, parentA.getSize() - 2);
      const x2 = randRange(x1 + 1, parentA.getSize());

      // Create two children through crossover
      const childA = crossover(parentA, parentB, x1, x2);
      const childB = crossover(parentB, parentA, x1, x2);

      // Mutate the children
      mutate(childA);
      mutate(childB);

      // Add the children to the new pool
      newPool[newPoolIndex++] = childA;
      newPool[newPoolIndex++] = childB;
    }

    // Copy the elite schedules to the new pool
    const eliteCount = Math.floor(popSize * elitePercentage);

    for (let i = 0; i < eliteCount; i++) {
      newPool[newPoolIndex++] = oldPool[i];
    }

    // Swap the pools
    [oldPool, newPool] = [newPool, oldPool];

    // Sort the new current pool by score
    oldPool.sort((a, b) => b.score - a.score);

    // Log progress every 10 generations
    if (generation % 10 === 0 || generation === generations - 1) {
      console.log(
        `Generation ${generation}: Best score = ${oldPool[0].score.toFixed(4)}`
      );
    }
  }

  return oldPool[0];
}

export { swapRandomEvents, mutate, crossover, optimizeSchedule };
