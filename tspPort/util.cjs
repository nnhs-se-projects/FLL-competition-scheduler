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
function countOccurrences(genome, geneToCount, start, end) {
  let count = 0;
  const genes = genome.getGenesInRange(start, end);
  for (const gene of genes) {
    if (gene.equals(geneToCount)) {
      count++;
    }
  }
  return count;
}

module.exports = { randRange, countOccurrences };
