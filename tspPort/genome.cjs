const { swapRandTwo } = require("./geneticAlgorithm.cjs");

class Genome {
  constructor() {
    this.genes = [];
    this.score = 0;
    this.mutationProbability = 0.1;
  }

  populateWithRandomGenes(size) {
    for (let i = 0; i < size; i++) {
      this.genes.push(i);
    }

    for (let i = 0; i < size; i++) {
      swapRandTwo(this.genes);
    }

    this.updateScore();
  }

  createCopy() {
    const copy = new Genome();
    copy.genes = this.genes.slice();
    copy.updateScore();
    return copy;
  }

  updateScore() {
    this.score = 0;
    for (let i = 0; i < this.genes.length - 1; i++) {
      this.score += Math.abs(this.genes[i] - this.genes[i + 1]);
    }
    this.score += Math.abs(this.genes[this.genes.length - 1] - this.genes[0]);
  }
}

module.exports = { Genome };
