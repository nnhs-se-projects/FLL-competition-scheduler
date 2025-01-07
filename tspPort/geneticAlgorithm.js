import { randRange, countOccurrences } from "./util.js";

// FIXME: generalize from index-based to asking the genome the range,
// which may not be the length (e.g., in a schedule it may be the duration of time)

/*
 * Function: swapRandTwo
 * --------------------
 * swaps two random genes in a genome
 * genome: the genome in which to swap genes
 */
function swapRandTwo(genome) {
  const a = randRange(0, genome.getRange());
  const b = randRange(0, genome.getRange());

  const temp = genome.getGeneAtIndex(a);
  genome.replaceGeneAtIndex(a, genome.getGeneAtIndex(b));
  genome.replaceGeneAtIndex(b, temp);
}

/*
 * Function: mutate
 * --------------------
 * mutates a genome by swapping two random genes with a probability of genome.mutationProbability
 * genome: the genome to mutate
 */
function mutate(genome) {
  for (let i = 0; i < genome.numberOfPotentialMutations; i++) {
    if (Math.random() < genome.mutationProbability) {
      swapRandTwo(genome);
    }
  }

  genome.updateScore();
}

/*
 * Function: crossover
 * --------------------
 * creates a child genome by crossing over two parent genomes
 *
 *     parentA ---------------------------------
 *                    ^           ^
 *                    x1          x2
 *     parentB +++++++++++++++++++++++++++++++++
 *                    ^           ^
 *                    x1          x2
 *
 *
 *       child ------+++++++++++++--------------
 *
 *      At a high level the array copying takes place in three stages:
 *        child[    0 .. x1-1     ]  = parentA    [    0 .. x1-1     ]
 *        child[   x1 .. x2-1     ]  = parentB [   x1 .. x2-1     ]
 *        child[  x2 .. length-1  ]  = parentA    [  x2 .. length-1  ]
 *
 *      The potential problem is that after we copy the array segments we may have an
 *      invalid genome with duplicate genes. The replaceDuplicates method addresses this.
 *
 * parentA: the first parent genome
 * parentB: the second parent genome
 * x1: the start index of the crossover
 * x2: the end index of the crossover
 * returns: the child genome
 */
function crossover(parentA, parentB, x1, x2) {
  const child = parentA.createCopy();
  child.replaceGenesInRange(0, x1, parentA.getGenesInRange(0, x1));
  child.replaceGenesInRange(x1, x2, parentB.getGenesInRange(x1, x2));
  child.replaceGenesInRange(
    x2,
    child.getRange(),
    parentA.getGenesInRange(x2, child.getRange())
  );

  replaceDuplicates(parentA, parentB, child, x1, x2);

  return child;
}

/*
 * Function: replaceDuplicates
 * --------------------
 * replaces any duplicate genes in the child with genes unique to the crossover segment of parentA
 *
 *  This method solves the potential problem is that after we copy the array segments we
 *      may have an invalid genome with duplicate genes as shown below:
 *        parentA a b c d e f g h i
 *                      ^^^^^
 *        parentB d h i c b e a g f
 *                      ^^^^^
 *        child   a b c c b e g h i
 *                      ^^^^^
 *      We can resolve this by:
 *          scan the crossover segment of parentA for elements that don't occur in
 *              the crossover segment of parentB:
 *                  uniq: d f
 *          scan the beginning and end segments of the child looking for duplicate
 *              elements in the crossed-over segment. When we find a duplicate replace it
 *              with an element of the 'uniq' array.
 *                  For example, replace 'b' with 'd'
 *                                       'c' with 'f'
 *              giving the new child:
 *                a d f c b e g h i
 *
 * parentA: the first parent genome
 * parentB: the second parent genome
 * child: the child genome
 * x1: the start index of the crossover
 * x2: the end index of the crossover
 */
function replaceDuplicates(parentA, parentB, child, x1, x2) {
  const uniqueGenes = [];

  for (let i = x1; i < x2; i++) {
    if (countOccurrences(parentB, parentA.getGeneAtIndex(i), x1, x2) === 0) {
      uniqueGenes.push(parentA.getGeneAtIndex(i));
    }
  }

  let uniqueIndex = 0;
  for (let i = 0; i < x1; i++) {
    if (countOccurrences(child, child.getGeneAtIndex(i), x1, x2) > 0) {
      child.replaceGeneAtIndex(i, uniqueGenes[uniqueIndex].copy());
      uniqueIndex++;
    }
  }

  for (let i = x2; i < child.getRange(); i++) {
    if (countOccurrences(child, child.getGeneAtIndex(i), x1, x2) > 0) {
      child.replaceGeneAtIndex(i, uniqueGenes[uniqueIndex].copy());
      uniqueIndex++;
    }
  }
}

export { swapRandTwo, mutate, crossover };
