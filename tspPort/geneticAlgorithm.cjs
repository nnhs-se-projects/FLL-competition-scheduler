const { randRange, countOccurrences } = require("./util.cjs");

// FIXME: generalize from index-based to asking the genome the range,
// which may not be the length (e.g., in a schedule it may be the duration of time)

function swapRandTwo(genome) {
  const a = randRange(0, genome.getRange());
  const b = randRange(0, genome.getRange());

  const temp = genome.getGenesInRange(a, a + 1);
  genome.replaceGenesInRange(a, a + 1, genome.getGenesInRange(b, b + 1));
  genome.replaceGenesInRange(b, b + 1, temp);
}

function mutate(genome) {
  if (Math.random() < genome.mutationProbability) {
    swapRandTwo(genome);
    genome.updateScore();
  }
}

function crossover(parentA, parentB, x1, x2) {
  const child = parentA.createCopy();

  for (let i = 0; i < x1; i++) {
    child.genes[i] = parentA.genes[i].copy();
  }

  for (let i = x1; i < x2; i++) {
    child.genes[i] = parentB.genes[i].copy();
  }

  for (let i = x2; i < parentA.genes.length; i++) {
    child.genes[i] = parentA.genes[i].copy();
  }

  replaceDuplicates(parentA, parentB, child, x1, x2);

  return child;
}

function replaceDuplicates(parentA, parentB, child, x1, x2) {
  const uniqueGenes = [];

  for (let i = x1; i < x2; i++) {
    if (countOccurrences(parentB, parentA.genes[i], x1, x2) === 0) {
      uniqueGenes.push(parentA.genes[i]);
    }
  }

  let uniqueIndex = 0;
  for (let i = 0; i < x1; i++) {
    if (countOccurrences(child, child.genes[i], x1, x2) > 0) {
      child.genes[i] = uniqueGenes[uniqueIndex].copy();
      uniqueIndex++;
    }
  }

  for (let i = x2; i < child.genes.length; i++) {
    if (countOccurrences(child, child.genes[i], x1, x2) > 0) {
      child.genes[i] = uniqueGenes[uniqueIndex].copy();
      uniqueIndex++;
    }
  }
}

module.exports = { swapRandTwo, mutate, crossover };
