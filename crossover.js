import { randomTable } from "./newRandomTables.js";
import { gradeTables } from "./tableGrading.js";
import { test } from "./test.js";
import { tableTest } from "./tableTest.js";
import {
  createFullSchedule,
  logJudgingRoomsSchedule,
  logTableRunsSchedule,
  scoreSchedule,
  buildTeamsSchedule,
} from "./fullRandomSchedule.js";

const POPULATION = 10;
const TOTAL_GENERATIONS = 10;

function run() {
  let newPool = [];
  let oldPool = [];
  let best = null;

  // create an initial random population of schedules
  for (let i = 0; i < POPULATION; i++) {
    let parent = createFullSchedule();
    oldPool.push(parent);
  }

  // EVALUATE INITIAL POPULATION

  oldPool.sort((a, b) => scoreSchedule(b) - scoreSchedule(a));
  best = oldPool[0];

  // iterate for the specific number of generations
  for (let i = 0; i < TOTAL_GENERATIONS; i++) {
    console.log("generation", i);

    oldPool.sort((a, b) => scoreSchedule(b) - scoreSchedule(a));
    best = oldPool[0];

    console.log("best score", scoreSchedule(best));
    console.log(getScheduleEndTime(best));
    console.log(logJudgingRoomsSchedule(best));
    console.log(logTableRunsSchedule(best));

    for (let j = 0; j < POPULATION / 2; j++) {
      let children = [];
      children = performGeneticAlgorithm(oldPool);
      let test1 = test(children[0]);
      let test2 = test(children[1]);
      if (test1 == "Failures" || test2 == "Failures") {
        j--;
        continue;
      } else {
        // Create schedule start times and durations
        for (let k = 0; k < 2; k++) {
          let int = 0;
          for (let l = 0; l < children[0][k].length; l++) {
            children[0][k][l].start = int;
            children[0][k][l].duration = 10;
            children[1][k][l].start = int;
            children[1][k][l].duration = 10;
            if (int === 150) {
              int += 50;
            } else {
              int += 10;
            }
          }
        }
        for (let k = 2; k < 4; k++) {
          let int = 5;
          for (let l = 0; l < children[0][k].length; l++) {
            children[0][k][l].start = int;
            children[0][k][l].duration = 10;
            children[1][k][l].start = int;
            children[1][k][l].duration = 10;
            if (int === 145) {
              int += 60;
            } else {
              int += 10;
            }
          }
        }
        newPool.push(children[0]);
        newPool.push(children[1]);
      }
    }

    oldPool = newPool;
    newPool = [];
    // sort old pool
    let grade = gradeTables(oldPool, POPULATION);

    let temp = [];
    for (let i = 60; i > -50; i--) {
      for (let j = 0; j < grade.length; j++) {
        if (grade[j] === i) {
          temp.push(oldPool[j]);
        }
      }
    }

    oldPool = temp;
    let newGrade = gradeTables(oldPool, POPULATION);
    console.log("newGrade: ", newGrade);

    //console.log("grade", gradeTables([best], 1));
  }
  console.log("grade", gradeTables([best], 1));
  console.log("best", best);
}

function performGeneticAlgorithm(oldPool) {
  let parentA = oldPool[Math.floor(Math.random() * (oldPool.length / 2))];
  let parentB = oldPool[Math.floor(Math.random() * (oldPool.length / 2))];
  while (parentA === parentB) {
    parentB = oldPool[Math.floor(Math.random() * (oldPool.length / 2))];
  }

  // STEP 2: CROSSOVER
  // get the children
  let children = crossOver(parentA, parentB);
  while (children[0] == null || children[1] == null) {
    children = crossOver(parentA, parentB);
  }

  // STEP 3: MUTATION
  let childA = mutate(children[0]);
  let childB = mutate(children[1]);

  // STEP 4: ADD TO NEW POOL

  // for (let i = 0; i < childA[0].length; i++) {
  //   let int = i * 10;
  //   if (int > 140) {
  //     // lunch break
  //     int = int + 50;
  //   }
  //   childA[0][i].start = int;
  //   childA[0][i].duration = 10;
  //   childB[0][i].start = int;
  //   childB[0][i].duration = 10;
  //   childA[1][i].start = int;
  //   childA[1][i].duration = 10;
  //   childB[1][i].start = int;
  //   childB[1][i].duration = 10;
  // }
  // for (let i = 0; i < childA[2].length; i++) {
  //   let int = i * 10 + 5;
  //   if (int > 140) {
  //     // lunch break
  //     int = int + 50;
  //   }
  //   childA[2][i].start = int;
  //   childA[2][i].duration = 10;
  //   childB[2][i].start = int;
  //   childB[2][i].duration = 10;
  //   childA[3][i].start = int;
  //   childA[3][i].duration = 10;
  //   childB[3][i].start = int;
  //   childB[3][i].duration = 10;
  // }

  children = [childA, childB];

  return children;
}
function crossOver(parentA, parentB) {
  const endTime = Math.max(
    getScheduleEndTime(parentA),
    getScheduleEndTime(parentB)
  );

  // select the cross over points in terms of time
  const x1 = Math.random() * (endTime - 25 * 3 - 25) + 25;
  const x2 = Math.random() * (endTime - 25 - (x1 + 25)) + x1 + 25;

  console.log("x1", x1, "; x2", x2);

  let childA = makeEmptySchedule();
  let childB = makeEmptySchedule();

  // cross over the table run schedules
  const tableScheduleA = parentA[0];
  const tableScheduleB = parentB[0];

  // iterate through each table; this assumes that the start times for each run are consistent across all schedules
  for (let i = 0; i < tableScheduleA.length; i++) {
    // iterate through each table run at the table
    for (let j = 0; j < tableScheduleA[i].length; j++) {
      const tableRunA = tableScheduleA[i][j];
      const tableRunB = tableScheduleB[i][j];
      if (tableRunA.start < x1) {
        childA[0][i].push(tableRunA);
        childB[0][i].push(tableRunB);
      } else if (tableRunA.start < x2) {
        childA[0][i].push(tableRunB);
        childB[0][i].push(tableRunA);
      } else {
        childA[0][i].push(tableRunA);
        childB[0][i].push(tableRunB);
      }
    }
  }

  // cross over the judging room schedules
  const judgingScheduleA = parentA[1];
  const judgingScheduleB = parentB[1];

  // iterate through each judging room; this assumes that the start times for each session are consistent across all schedules
  for (let i = 0; i < judgingScheduleA.length; i++) {
    // iterate through each session in the judging room
    for (let j = 0; j < judgingScheduleA[i].length; j++) {
      const sessionA = judgingScheduleA[i][j];
      const sessionB = judgingScheduleB[i][j];
      if (sessionA.startT < x1) {
        childA[1][i].push(sessionA);
        childB[1][i].push(sessionB);
      } else if (sessionA.startT < x2) {
        childA[1][i].push(sessionB);
        childB[1][i].push(sessionA);
      } else {
        childA[1][i].push(sessionA);
        childB[1][i].push(sessionB);
      }
    }
  }

  console.log("Parent A");
  logJudgingRoomsSchedule(parentA);
  console.log("Parent B");
  logJudgingRoomsSchedule(parentB);
  console.log("Child A");
  logJudgingRoomsSchedule(childA);
  console.log("Child B");
  logJudgingRoomsSchedule(childB);

  console.log("Parent A");
  logTableRunsSchedule(parentA);
  console.log("Parent B");
  logTableRunsSchedule(parentB);
  console.log("Child A");
  logTableRunsSchedule(childA);
  console.log("Child B");
  logTableRunsSchedule(childB);

  return [childA, childB];

  let child1 = [c1t1, c1t2, c1t3, c1t4];
  let child2 = [c2t1, c2t2, c2t3, c2t4];
  let rChild1 = replaceDuplicates(child1, x1, x2);
  let rChild2 = replaceDuplicates(child2, x1, x2);
  return [rChild1, rChild2];
}

function replaceDuplicates(child, x1, x2) {
  let duplicates = [];
  let missing = [];
  let loops = 0;
  let loops2 = 0;
  // adds to a temporary array each time a specific team is found. Then checks and adds any missing or duplicates
  // repeats for each team
  for (let t = 1; t < 33; t++) {
    let temp = [];
    for (let i = 0; i < child.length; i++) {
      for (let j = 0; j < child[i].length; j++) {
        if (child[i][j].name === "team" + t) {
          let arr = [i, j, child[i][j]];
          temp.push(arr);
        }
      }
    }
    // checks for duplicates and missing teams
    let run1 = 0;
    let run2 = 0;
    let run3 = 0;
    for (let i = 0; i < temp.length; i++) {
      if (temp[i][2].run === 1) {
        run1++;
      } else if (temp[i][2].run === 2) {
        run2++;
      } else if (temp[i][2].run === 3) {
        run3++;
      }
    }
    if (run1 > 1) {
      for (let k = 0; k < temp.length; k++) {
        if (temp[k][2].run === 1 && temp[k][1] >= x1 && temp[k][1] < x2) {
          duplicates.push(temp[k]);
        }
      }
    } else if (run1 < 1) {
      let str = { name: "team" + t, run: 1 };
      missing.push(str);
    }

    if (run2 > 1) {
      for (let j = 0; j < temp.length; j++) {
        if (temp[j][2].run === 2 && temp[j][1] >= x1 && temp[j][1] < x2) {
          duplicates.push(temp[j]);
        }
      }
    } else if (run2 < 1) {
      let str = { name: "team" + t, run: 2 };
      missing.push(str);
    }

    if (run3 > 1) {
      for (let i = 0; i < temp.length; i++) {
        if (temp[i][2].run === 3 && temp[i][1] >= x1 && temp[i][1] < x2) {
          duplicates.push(temp[i]);
        }
      }
    } else if (run3 < 1) {
      const str = { name: "team" + t, run: 3 };
      missing.push(str);
    }
  }

  function swap(tableNum) {
    // swaps a duplicate with a missing team
    while (loops2 < 100) {
      loops2++;
      const rand = Math.floor(Math.random() * (x2 - x1) + x1);
      const temp = child[tableNum][rand];
      if (
        missing.length > 0 &&
        child[0][rand].name !== missing[0].name &&
        child[1][rand].name !== missing[0].name &&
        child[2][rand].name !== missing[0].name &&
        child[3][rand].name !== missing[0].name
      ) {
        child[tableNum][rand] = missing[0];
        missing[0] = temp;
        return "done";
      } else if (x1 > 1 && x2 < 22) {
        if (
          child[0][rand].name !== temp.name &&
          child[1][rand].name !== temp.name &&
          child[2][rand].name !== temp.name &&
          child[3][rand].name !== temp.name &&
          child[0][rand - 1].name !== temp.name &&
          child[1][rand - 1].name !== temp.name &&
          child[2][rand - 1].name !== temp.name &&
          child[3][rand - 1].name !== temp.name &&
          child[0][rand + 1].name !== temp.name &&
          child[1][rand + 1].name !== temp.name &&
          child[2][rand + 1].name !== temp.name &&
          child[3][rand + 1].name !== temp.name
        ) {
          child[tableNum][rand] = missing[0];
          missing[0] = temp;
          return "done";
        }
      }
    }
    if (loops2 === 100) {
      return null;
    }
  }

  let length = duplicates.length;

  if (length < 5) {
    if (
      duplicates.length === 2 &&
      duplicates[0][2].run === duplicates[1][2].run
    ) {
      duplicates.splice(0, 1);
      length = duplicates.length;
    }
    for (let i = 0; i < length; i++) {
      // swaps all duplicates if there are less than 5
      const index = duplicates[i][1];
      if (
        missing.length > 0 &&
        x1 > 1 &&
        x2 < 22 &&
        missing[0].name !== child[0][index].name &&
        missing[0].name !== child[1][index].name &&
        missing[0].name !== child[2][index].name &&
        missing[0].name !== child[3][index].name &&
        missing[0].name !== child[0][index - 1].name &&
        missing[0].name !== child[1][index - 1].name &&
        missing[0].name !== child[2][index - 1].name &&
        missing[0].name !== child[3][index - 1].name &&
        missing[0].name !== child[0][index + 1].name &&
        missing[0].name !== child[1][index + 1].name &&
        missing[0].name !== child[2][index + 1].name &&
        missing[0].name !== child[3][index + 1].name
      ) {
        child[duplicates[i][0]][duplicates[i][1]] = missing[0];
        missing.splice(0, 1);
        // goes to else if when x1 is greater than 1 and x2 is less than 22
      } else if (
        missing.length > 0 &&
        missing[0].name !== child[0][index].name &&
        missing[0].name !== child[1][index].name &&
        missing[0].name !== child[2][index].name &&
        missing[0].name !== child[3][index].name
      ) {
        child[duplicates[i][0]][duplicates[i][1]] = missing[0];
        missing.splice(0, 1);
      } else {
        let swapResult = swap(duplicates[i][0]);
        if (swapResult === "done") {
          i--;
          continue;
        } else if (swapResult === null) {
          return null;
        }
      }
    }
  } else {
    for (let i = 0; i < length - 4; i++) {
      // swaps all but 4 duplicates
      if (loops > 100) {
        return null;
      }
      let rand = Math.floor(Math.random() * missing.length);
      const index = duplicates[i][1];
      if (
        missing[rand].name !== undefined &&
        missing[rand].name !== child[0][index].name &&
        missing[rand].name !== child[1][index].name &&
        missing[rand].name !== child[2][index].name &&
        missing[rand].name !== child[3][index].name
      ) {
        child[duplicates[i][0]][duplicates[i][1]] = missing[rand];
        missing.splice(rand, 1);
      } else {
        loops++;
        i--;
        continue;
      }
    }
    if (missing.length <= 3) {
      return null;
    }
    for (let i = length - 4; i < length; i++) {
      // swaps the last 4 duplicates
      const index = duplicates[i][1];
      if (
        missing.length > 0 &&
        missing[0].name !== child[0][index].name &&
        missing[0].name !== child[1][index].name &&
        missing[0].name !== child[2][index].name &&
        missing[0].name !== child[3][index].name
      ) {
        child[duplicates[i][0]][duplicates[i][1]] = missing[0];
        missing.splice(0, 1);
      } else {
        let swapResult = swap(duplicates[i][0]);
        if (swapResult === "done") {
          i--;
          continue;
        } else if (swapResult === null) {
          return null;
        }
      }
    }
  }
  return child;
}

for (let i = 0; i < 1; i++) {
  console.log("run", i + 1);
  run();
}

function mutate(crossoverChildren) {
  // decides if mutation will occur
  let randomNum = Math.floor(Math.random() * 10 + 1);
  if (randomNum === 1) {
    return swapRandTwo(crossoverChildren);
  } else {
    return crossoverChildren;
  }
}

function swapRandTwo(child) {
  for (let i = 0; i < 4; i++) {
    // swaps two random teams
    let rand1 = Math.floor(Math.random() * child[i].length);
    let rand2 = Math.floor(Math.random() * child[i].length);
    let teamSwap = child[i][rand1];
    child[i][rand1] = child[i][rand2];
    child[i][rand2] = teamSwap;
  }
  return child;
}

function getScheduleEndTime(schedule) {
  let teamsSchedule = buildTeamsSchedule(schedule);
  let endTime = 0;
  endTime = teamsSchedule.reduce((max, current) => {
    max = Math.max(
      max,
      current[current.length - 1].startTime +
        current[current.length - 1].duration
    );
    return max;
  }, 0);
  return endTime;
}

function makeEmptySchedule() {
  // first element is for table runs, second element is for judging rooms
  const schedule = [[], []];

  // create an empty table run schedule for each table
  for (let i = 0; i < 4; i++) {
    schedule[0].push([]);
  }

  // create an empty judging room schedule for each judging room
  for (let i = 0; i < 8; i++) {
    schedule[1].push([]);
  }
  return schedule;
}
