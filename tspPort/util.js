// utility functions

/*
 * Function: randRange
 * --------------------
 * generates a random number between m (inclusive) and n (exclusive) [m, n)
 *
 *
 */
function randRange(m, n) {
  return Math.floor(Math.random() * (n - m)) + m;
}

/*
 * Function: count
 * --------------------
 * counts the number of occurrences of a value in an array
 * between the start (inclusive) and end (exclusive) indices
 *
 */
function count(arr, value, start, end) {
  let count = 0;
  for (let i = start; i < end; i++) {
    if (arr[i] === value) {
      count++;
    }
  }
  return count;
}

module.exports = { randRange, count };
