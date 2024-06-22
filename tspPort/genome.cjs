const { swapRandTwo } = require("./geneticAlgorithm.cjs");

const NUM_GENES = 10;

class Genome {
  constructor() {
    this.genes = [];
    this.score = 0;
    this.mutationProbability = 0.1;
  }

  populateWithRandomGenes() {
    for (let i = 0; i < NUM_GENES; i++) {
      this.genes.push(new Gene(i));
    }

    for (let i = 0; i < NUM_GENES; i++) {
      swapRandTwo(this);
    }

    this.updateScore();
  }

  createCopy() {
    const copy = new Genome();
    for (const val of this.genes) {
      copy.genes.push(val.copy());
    }
    copy.updateScore();
    return copy;
  }

  getRange() {
    return this.genes.length;
  }

  getGenesInRange(start, end) {
    return this.genes.slice(start, end);
  }

  replaceGenesInRange(start, end, genes) {
    this.genes.splice(start, end - start, ...genes);
    this.updateScore();
  }

  updateScore() {
    this.score = 0;
    for (let i = 0; i < this.genes.length - 1; i++) {
      this.score += Math.abs(this.genes[i].value - this.genes[i + 1].value);
    }
    this.score += Math.abs(
      this.genes[this.genes.length - 1].value - this.genes[0].value
    );
  }
}

class Gene {
  constructor(value) {
    this.value = value;
  }

  equals(otherGene) {
    return this.value === otherGene.value;
  }

  copy() {
    return new Gene(this.value);
  }
}

module.exports = { Genome, Gene };
