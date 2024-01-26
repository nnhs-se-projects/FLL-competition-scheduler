import { randomTable } from "./randomTable.js";

const POPULATION = 10;

const newPool = [];
const oldPool = [];

function crossOver(x1, x2, parentA, parentB) {
  let children = [];
  let child1 = [];
  let child2 = [];
  let c1t1 = [];
  let c1t2 = [];
  let c1t3 = [];
  let c1t4 = [];
  let c2t1 = [];
  let c2t2 = [];
  let c2t3 = [];
  let c2t4 = [];

  for (let i = 0; i < x1; i++) {
    c1t1.push(parentA[0][i]);
  }
  for (let i = x1; i < x2; i++) {
    c1t1.push(parentB[0][i]);
  }
  for (let i = x2; i < parentA[0].length; i++) {
    c1t1.push(parentA[0][i]);
  }
  console.log(c1t1);
}

function geneticAlgorithm() {
  let parentA = randomTable();
  let parentB = randomTable();

  let x1 = Math.floor((Math.random() * parentA[0].length) / 2 + 1);
  let x2 = Math.floor(Math.random() * (parentA[0].length / 2) + x1);

  crossOver(x1, x2, parentA, parentB);
}

geneticAlgorithm();
