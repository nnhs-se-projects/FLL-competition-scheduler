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
      if (child[room].some((e) => e.name === "team" + i)) {
        rr = child[room].findIndex((e) => e.name == "team" + i);
      }
    }
    for (let room = child.length / 2; room < child.length; room++) {
      if (child[room].some((e) => e.name === "team" + i)) {
        pr = child[room].findIndex((e) => e.name == "team" + i);
      }
    }

    let num = child[0].length / 2;

    //check if spacing is less than num/2 or greater than 3num/2 then teamScore = 0
    if (Math.abs(rr - pr) < num / 2 || Math.abs(rr - pr) > (3 * num) / 2) {
      totalScore = 0;
      return totalScore;
    }

    let teamScore = Math.abs(rr - pr) / parseFloat(num);

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
