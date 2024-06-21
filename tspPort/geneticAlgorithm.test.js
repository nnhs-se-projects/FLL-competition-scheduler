const { Genome, Gene } = require("./genome.cjs");
const { swapRandTwo, mutate, crossover } = require("./geneticAlgorithm.cjs");
const { countOccurrences } = require("./util.cjs");

test("check createCopy", () => {
  const genome = new Genome();
  genome.populateWithRandomGenes();
  const copy = genome.createCopy();
  expect(genome.genes).toEqual(copy.genes);
  expect(genome.genes).not.toBe(copy.genes);
});

test("check swapRandTwo", () => {
  const genome = new Genome();
  genome.populateWithRandomGenes();
  for (let i = 0; i < genome.getRange(); i++) {
    genome.replaceGenesInRange(i, i + 1, [new Gene(i)]);
  }

  let randCount = 0;

  for (let i = 0; i < 1000; i++) {
    const genome2 = genome.createCopy();
    swapRandTwo(genome);
    let index1 = -1;
    let index2 = -1;

    for (let j = 0; j < genome.getRange(); j++) {
      if (
        !genome
          .getGenesInRange(j, j + 1)[0]
          .equals(genome2.getGenesInRange(j, j + 1)[0])
      ) {
        if (index1 === -1) {
          index1 = j;
          randCount++;
        } else if (index2 === -1) {
          index2 = j;
        } else {
          expect(true).toBe(false);
        }
      }
    }

    if (index1 !== -1 && index2 !== -1) {
      expect(
        genome2
          .getGenesInRange(index1, index1 + 1)[0]
          .equals(genome.getGenesInRange(index2, index2 + 1)[0])
      ).toBe(true);
      expect(
        genome2
          .getGenesInRange(index2, index2 + 1)[0]
          .equals(genome.getGenesInRange(index1, index1 + 1)[0])
      ).toBe(true);
    }
  }

  expect(randCount).toBeGreaterThanOrEqual(800);
});

test("check populateWithRandomGenes", () => {
  let duplicateCount = 0;
  let prevGenome = new Genome();
  prevGenome.populateWithRandomGenes();

  for (let i = 0; i < 1000; i++) {
    const genome = new Genome();
    genome.populateWithRandomGenes();

    genome.genes.forEach((gene) => {
      expect(countOccurrences(genome, gene, 0, genome.getRange())).toBe(1);
    });

    let duplicate = true;
    for (let j = 0; j < genome.getRange(); j++) {
      if (
        !genome
          .getGenesInRange(j, j + 1)[0]
          .equals(prevGenome.getGenesInRange(j, j + 1)[0])
      ) {
        duplicate = false;
      }
    }

    if (duplicate) {
      duplicateCount++;
    }
    prevGenome = genome;
  }

  expect(duplicateCount).toBeLessThan(5);
});

test("check updateScore", () => {
  const genome = new Genome();
  genome.genes = [];
  for (const value of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    genome.genes.push(new Gene(value));
  }

  genome.updateScore();
  expect(genome.score).toBe(18);

  genome.updateScore();
  expect(genome.score).toBe(18);

  genome.genes = [];
  for (const value of [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]) {
    genome.genes.push(new Gene(value));
  }

  genome.updateScore();
  expect(genome.score).toBe(36);

  genome.updateScore();
  expect(genome.score).toBe(36);
});

test("check mutation", () => {
  const genome = new Genome();
  genome.populateWithRandomGenes();
  let previousScore = genome.score;
  let mutateCount = 0;

  for (let i = 0; i < 1000; i++) {
    mutate(genome);
    if (genome.score !== previousScore) {
      mutateCount++;
    }
    previousScore = genome.score;
  }

  expect(
    Math.abs(genome.mutationProbability - mutateCount / 1000.0)
  ).toBeLessThan(0.05);
});

test("check crossover", () => {
  let parentA;
  let parentB;

  do {
    parentA = new Genome();
    parentA.populateWithRandomGenes();
    parentB = new Genome();
    parentB.populateWithRandomGenes();
  } while (
    parentA.genes.every((value, index) => value === parentB.genes[index])
  );

  let testIndexPairs = [
    [0, 0],
    [8, 8],
    [5, 5],
  ];

  for (const indexPair of testIndexPairs) {
    const child = crossover(parentA, parentB, indexPair[0], indexPair[1]);

    expect(child.genes.length).toBe(parentA.genes.length);
    expect(
      parentA.genes.every((value, index) => value === child.genes[index])
    ).toBe(true);
  }

  testIndexPairs = [[0, 9]];
  for (const indexPair of testIndexPairs) {
    const child = crossover(parentA, parentB, indexPair[0], indexPair[1]);

    expect(child.genes.length).toBe(parentA.genes.length);
    expect(
      parentB.genes.every((value, index) => value === child.genes[index])
    ).toBe(true);
  }

  for (let x1 = 0; x1 < parentA.genes.length - 2; x1++) {
    for (let x2 = x1; x2 < parentA.genes.length; x2++) {
      const child = crossover(parentA, parentB, x1, x2);
      expect(child.genes.length).toBe(parentA.genes.length);
      expect(
        parentA.genes.every(
          (value, index) =>
            countOccurrences(child.genes, value, 0, child.genes.length) === 1
        )
      ).toBe(true);
      expect(
        parentB.genes.every(
          (value, index) =>
            countOccurrences(child.genes, value, 0, child.genes.length) === 1
        )
      ).toBe(true);
    }
  }
});
