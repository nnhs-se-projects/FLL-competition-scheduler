const { randRange, countOccurrenceInArray } = require("./util.cjs");

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
  for (let i = 0; i < RANGE; i++) {
    expect(Math.abs(ITERATIONS / RANGE - frequencies[i])).toBeLessThan(
      TOLERANCE
    );
  }
});

test("check countOccurrenceInArray function", () => {
  let testArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  // test if value never occurs in array
  expect(countOccurrenceInArray(testArray, 10, 0, 10)).toBe(0);

  // test if value occurs once at start of array / range
  expect(countOccurrenceInArray(testArray, 0, 0, 10)).toBe(1);

  // test if value occurs once at end of array / range
  expect(countOccurrenceInArray(testArray, 9, 0, 10)).toBe(1);

  testArray = [0, 1, 2, 0, 4, 4, 9, 7, 4, 9];

  // test if value occurs 2 times (including at start)
  expect(countOccurrenceInArray(testArray, 0, 0, 10)).toBe(2);

  // test if value occurs 2 times (including at end)
  expect(countOccurrenceInArray(testArray, 9, 0, 10)).toBe(2);

  // test if value occurs 3 times (including twice in a row)
  expect(countOccurrenceInArray(testArray, 4, 0, 10)).toBe(3);

  testArray = [9, 1, 2, 0, 9, 4, 9, 7, 4, 9];

  // test if value occurs within subset of array
  expect(countOccurrenceInArray(testArray, 9, 4, 7)).toBe(2);
});
