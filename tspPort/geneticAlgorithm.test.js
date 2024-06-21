const { Genome } = require("./genome.cjs");
const { swapRandTwo, mutate, crossover } = require("./geneticAlgorithm.cjs");
const { countOccurrenceInArray } = require("./util.cjs");

test("check createCopy", () => {
  const genome = new Genome();
  genome.populateWithRandomGenes(10);
  const copy = genome.createCopy();
  expect(genome.genes).toEqual(copy.genes);
  expect(genome.genes).not.toBe(copy.genes);
});

test("check swapRandTwo", () => {
  const genome = new Genome();
  genome.populateWithRandomGenes(10);
  for (let i = 0; i < genome.genes.length; i++) {
    genome.genes[i] = i;
  }

  let randCount = 0;

  for (let i = 0; i < 1000; i++) {
    const genome2 = genome.createCopy();
    swapRandTwo(genome.genes);
    let index1 = 0;
    let index2 = 0;

    for (let j = 0; j < genome.genes.length; j++) {
      if (genome.genes[j] !== genome2.genes[j]) {
        if (index1 === 0) {
          index1 = j;
          randCount++;
        } else if (index2 === 0) {
          index2 = j;
        } else {
          expect(true).toBe(false);
        }
      }
    }

    expect(genome2.genes[index1]).toBe(genome.genes[index2]);
    expect(genome2.genes[index2]).toBe(genome.genes[index1]);
  }

  expect(randCount).toBeGreaterThanOrEqual(800);
});

test("check populateWithRandomGenes", () => {
  let duplicateCount = 0;
  let prevGenome = new Genome();
  prevGenome.populateWithRandomGenes(10);

  for (let i = 0; i < 1000; i++) {
    const genome = new Genome();
    genome.populateWithRandomGenes(10);

    genome.genes.forEach((gene) => {
      expect(
        countOccurrenceInArray(genome.genes, gene, 0, genome.genes.length)
      ).toBe(1);
    });

    if (
      prevGenome.genes.length === genome.genes.length &&
      prevGenome.genes.every((value, index) => value === genome.genes[index])
    ) {
      duplicateCount++;
    }
    prevGenome = genome;
  }

  expect(duplicateCount).toBeLessThan(5);
});

test("check updateScore", () => {
  const genome = new Genome();
  genome.genes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  genome.updateScore();
  expect(genome.score).toBe(18);

  genome.updateScore();
  expect(genome.score).toBe(18);

  genome.genes = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18];

  genome.updateScore();
  expect(genome.score).toBe(36);

  genome.updateScore();
  expect(genome.score).toBe(36);
});

test("check mutation", () => {
  const genome = new Genome();
  genome.populateWithRandomGenes(10);
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
    parentA.populateWithRandomGenes(10);
    parentB = new Genome();
    parentB.populateWithRandomGenes(10);
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
            countOccurrenceInArray(
              child.genes,
              value,
              0,
              child.genes.length
            ) === 1
        )
      ).toBe(true);
      expect(
        parentB.genes.every(
          (value, index) =>
            countOccurrenceInArray(
              child.genes,
              value,
              0,
              child.genes.length
            ) === 1
        )
      ).toBe(true);
    }
  }
});
