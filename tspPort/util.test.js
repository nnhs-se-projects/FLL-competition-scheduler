import { Genome, Gene } from "./genome.js";
import { randRange, countOccurrences } from "./util.js";

test("check range of randRange", () => {
  for (let i = 0; i < 1000; i++) {
    const value = randRange(5, 15);
    expect(value).toBeGreaterThanOrEqual(5);
    expect(value).toBeLessThan(15);
  }
});

test("check frequency of randRange", () => {
  const MIN = 5;
  const MAX = 15;
  const RANGE = MAX - MIN;
  const ITERATIONS = 100000;
  const TOLERANCE = ITERATIONS / 20;

  const frequencies = new Array(RANGE).fill(0);
  for (let i = 0; i < ITERATIONS; i++) {
    frequencies[randRange(MIN, MAX) - MIN]++;
  }
  frequencies.forEach((value) => {
    expect(Math.abs(ITERATIONS / RANGE - value)).toBeLessThan(TOLERANCE);
  });
});

test("check countOccurrences function", () => {
  const testGenome = new Genome();
  for (let i = 0; i < 10; i++) {
    testGenome.genes.push(new Gene(i));
  }

  // test if value never occurs in array
  expect(countOccurrences(testGenome, new Gene(10), 0, 10)).toBe(0);

  // test if value occurs once at start of array / range
  expect(countOccurrences(testGenome, new Gene(0), 0, 10)).toBe(1);

  // test if value occurs once at end of array / range
  expect(countOccurrences(testGenome, new Gene(9), 0, 10)).toBe(1);

  testGenome.genes = [];
  [0, 1, 2, 0, 4, 4, 9, 7, 4, 9].forEach((value) => {
    testGenome.genes.push(new Gene(value));
  });

  // test if value occurs 2 times (including at start)
  expect(countOccurrences(testGenome, new Gene(0), 0, 10)).toBe(2);

  // test if value occurs 2 times (including at end)
  expect(countOccurrences(testGenome, new Gene(9), 0, 10)).toBe(2);

  // test if value occurs 3 times (including twice in a row)
  expect(countOccurrences(testGenome, new Gene(4), 0, 10)).toBe(3);

  testGenome.genes = [];
  [9, 1, 2, 0, 9, 4, 9, 7, 4, 9].forEach((value) => {
    testGenome.genes.push(new Gene(value));
  });

  // test if value occurs within subset of array
  expect(countOccurrences(testGenome, new Gene(9), 4, 7)).toBe(2);
});
