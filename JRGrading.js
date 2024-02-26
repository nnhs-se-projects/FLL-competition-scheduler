// param -> child
// we have to know how many teams (ex: 1-32)
// grade each team
//    take the indexes of RR spot and PR spot and find the distance
//    greater distance is better score (find abs value and divide by num of time slots)
// array to hold the scores
// add up all the team scores and divide by num of teams to get avg score => this is the final score of the child
// return final score

let newPool = [];
let oldPool = [];

function jrGrading(child) {
  let teamGrades = [];
  let numTeams = 32;
  let totalScore = 0.0;

  for (let i = 1; i < numTeams + 1; i++) {
    let rr = 0;
    let pr = 0;

    for (let room = 0; room < child.length / 2; room++) {
      if (child[room].includes("team" + i)) {
        rr = child[room].indexOf("team" + i);
      }
    }
    for (let room = child.length / 2; room < child.length; room++) {
      if (child[room].includes("team" + i)) {
        pr = child[room].indexOf("team" + i);
      }
    }
    let teamScore = Math.abs(rr - pr) / parseFloat(child[0].length);
    teamGrades.push(teamScore);
  }

  //console.log("Team Grades: ");
  //console.log(teamGrades);

  for (let i = 0; i < teamGrades.length; i++) {
    totalScore += teamGrades[i];
  }
  totalScore /= numTeams;

  return totalScore;
}

//create pool of 100 parents

//grade each parent in the array

export { jrGrading };
