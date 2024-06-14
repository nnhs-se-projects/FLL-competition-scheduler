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
  const teamsSchedule = [];

  // initialize teamsSchedule
  for (let i = 1; i <= 32; i++) {
    teamsSchedule[i] = [];
  }

  // iterate through each judging room
  for (let i = 0; i < child.length; i++) {
    // iterate through each team in the judging room
    for (let j = 0; j < child[i].length; j++) {
      const session = child[i][j];
      teamsSchedule[session.id].push({
        startTime: session.startT,
        duration: session.duration,
      });
    }
  }

  let grade = 0.0;

  for (let i = 1; i <= 32; i++) {
    const teamSchedule = teamsSchedule[i];
    const timeDiff = Math.abs(
      teamSchedule[0].startTime - teamSchedule[1].startTime
    );

    // if the times overlap, this is an invalid schedule, return 0
    if (timeDiff < 20) {
      return 0;
    } else if (timeDiff > 30 && timeDiff < 90) {
      grade += 1.0;
    }
  }

  return grade / 32.0;
}

//create pool of 100 parents

//grade each parent in the array

export { jrGrading };
