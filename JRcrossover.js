import { randomJS } from "./randomJudgingSesh.js";

const POPULATION = 10;

const newPool = [];
const oldPool = [];

function crossover(x1, x2, parentA, parentB) {
  // determine the three even crossover points
  // needs to be checked
  const length = parentA.length;
  const interval = Math.floor(length / 4);
  const crossoverPoint1 = interval;
  const crossoverPoint2 = interval * 2;
  const crossoverPoint3 = interval * 3;

  // determine the child by crossing Parent A and Parent B
  // const childA =
  // const childB  =

  // mutate the child

  // add the child to the new pool
}
