const { randRange, countOccurrenceInArray } = require("./util.cjs");

// FIXME: generalize from index-based to asking the genome the range,
// which may not be the length (e.g., in a schedule it may be the duration of time)

function swapRandTwo(arr) {
  const a = randRange(0, arr.length);
  const b = randRange(0, arr.length);

  const temp = arr[a];
  arr[a] = arr[b];
  arr[b] = temp;
}

function mutate(genome) {
  if (Math.random() < genome.mutationProbability) {
    swapRandTwo(genome.genes);
    genome.updateScore();
  }
}

function crossover(parentA, parentB, x1, x2) {
  const child = parentA.createCopy();

  for (let i = 0; i < x1; i++) {
    child.genes[i] = parentA.genes[i];
  }

  for (let i = x1; i < x2; i++) {
    child.genes[i] = parentB.genes[i];
  }

  for (let i = x2; i < parentA.genes.length; i++) {
    child.genes[i] = parentA.genes[i];
  }

  replaceDuplicates(parentA, parentB, child, x1, x2);

  return child;
}

function replaceDuplicates(parentA, parentB, child, x1, x2) {
  const uniqueGenes = [];

  for (let i = x1; i < x2; i++) {
    if (countOccurrenceInArray(parentB.genes, parentA.genes[i], x1, x2) === 0) {
      uniqueGenes.push(parentA.genes[i]);
    }
  }

  let uniqueIndex = 0;
  for (let i = 0; i < x1; i++) {
    if (countOccurrenceInArray(child.genes, child.genes[i], x1, x2) > 0) {
      child.genes[i] = uniqueGenes[uniqueIndex];
      uniqueIndex++;
    }
  }

  for (let i = x2; i < child.genes.length; i++) {
    if (countOccurrenceInArray(child.genes, child.genes[i], x1, x2) > 0) {
      child.genes[i] = uniqueGenes[uniqueIndex];
      uniqueIndex++;
    }
  }
}

module.exports = { swapRandTwo, mutate, crossover };
