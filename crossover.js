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
        childA[0][i].push(cloneTableRun(tableRunA));
        childB[0][i].push(cloneTableRun(tableRunB));
      } else if (tableRunA.start < x2) {
        childA[0][i].push(cloneTableRun(tableRunB));
        childB[0][i].push(cloneTableRun(tableRunA));
      } else {
        childA[0][i].push(cloneTableRun(tableRunA));
        childB[0][i].push(cloneTableRun(tableRunB));
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
        childA[1][i].push(cloneJudgingSession(sessionA));
        childB[1][i].push(cloneJudgingSession(sessionB));
      } else if (sessionA.startT < x2) {
        childA[1][i].push(cloneJudgingSession(sessionB));
        childB[1][i].push(cloneJudgingSession(sessionA));
      } else {
        childA[1][i].push(cloneJudgingSession(sessionA));
        childB[1][i].push(cloneJudgingSession(sessionB));
      }
    }
  }

  // FIXME: update start times and durations for table runs and judging sessions

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

  replaceDuplicates(parentA, parentB, childA, x1, x2);
  replaceDuplicates(parentB, parentA, childB, x1, x2);

  // FIXME: update start times and durations for table runs and judging sessions

  return [childA, childB];
}

function replaceDuplicates(parentA, parentB, child, x1, x2) {
  let uniqueTableRuns = [];
  // iterate through each table in parent A; this assumes that the start times for each run are consistent across all schedules
  for (let i = 0; i < parentA[0].length; i++) {
    // iterate through each table run at the table and focus on those in the cross-over segment
    for (let j = 0; j < parentA[0][i].length; j++) {
      const tableRunA = parentA[0][i][j];
      if (tableRunA.start >= x1 && tableRunA.start < x2) {
        if (
          countTeamTableRunsInTimePeriod(parentB[0], tableRunA, x1, x2) === 0
        ) {
          uniqueTableRuns.push(tableRunA);
        }
      }
    }
  }

  // iterate through each table in the child; this assumes that the start times for each run are consistent across all schedules
  for (let i = 0; i < child[0].length; i++) {
    // iterate through each table run at the table and focus on those in the first and third segments
    for (let j = 0; j < child[0][i].length; j++) {
      const tableRun = child[0][i][j];
      if (tableRun.start < x1 || tableRun.start >= x2) {
        if (countTeamTableRunsInTimePeriod(child[0], tableRun, x1, x2) > 0) {
          child[0][i][j] = uniqueTableRuns.pop();
        }
      }
    }
  }

  let uniqueJudgingSessions = [];
  // iterate through each judging room in parent A; this assumes that the start times for each run are consistent across all schedules
  for (let i = 0; i < parentA[0].length; i++) {
    // iterate through each session in the judging room and focus on those in the cross-over segment
    for (let j = 0; j < parentA[0][i].length; j++) {
      const session = parentA[0][i][j];
      if (session.startT >= x1 && session.startT < x2) {
        if (
          countTeamJudgingSessionsInTimePeriod(parentB[0], session, x1, x2) ===
          0
        ) {
          uniqueJudgingSessions.push(session);
        }
      }
    }
  }

  // iterate through each judging room in the child; this assumes that the start times for each run are consistent across all schedules
  for (let i = 0; i < child[0].length; i++) {
    // iterate through each session in the judging room and focus on those in the first and third segments
    for (let j = 0; j < child[0][i].length; j++) {
      const session = child[0][i][j];
      if (session.startT < x1 || session.startT >= x2) {
        if (
          countTeamJudgingSessionsInTimePeriod(child[0], session, x1, x2) > 0
        ) {
          child[0][i][j] = uniqueJudgingSessions.pop();
        }
      }
    }
  }
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

function countTeamTableRunsInTimePeriod(
  tablesSchedule,
  tableRun,
  startTime,
  endTime
) {
  let count = 0;
  for (let i = 0; i < tablesSchedule.length; i++) {
    for (let j = 0; j < tablesSchedule[i].length; j++) {
      if (
        tablesSchedule[i][j].id === tableRun.id &&
        tablesSchedule[i][j].run === tableRun.run &&
        tablesSchedule[i][j].start >= startTime &&
        tablesSchedule[i][j].start < endTime
      ) {
        count++;
      }
    }
  }
  return count;
}

function countTeamJudgingSessionsInTimePeriod(
  judgingSessionsSchedule,
  session,
  startTime,
  endTime
) {
  let count = 0;
  for (let i = 0; i < judgingSessionsSchedule.length; i++) {
    for (let j = 0; j < judgingSessionsSchedule[i].length; j++) {
      if (
        judgingSessionsSchedule[i][j].id === session.id &&
        judgingSessionsSchedule[i][j].type === session.type &&
        judgingSessionsSchedule[i][j].start >= startTime &&
        judgingSessionsSchedule[i][j].start < endTime
      ) {
        count++;
      }
    }
  }
  return count;
}

function cloneTableRun(tableRun) {
  return {
    id: tableRun.id,
    run: tableRun.run,
    start: tableRun.start,
    duration: tableRun.duration,
  };
}

function cloneJudgingSession(session) {
  return {
    id: session.id,
    type: session.type,
    startT: session.startT,
    duration: session.duration,
  };
}

for (let i = 0; i < 1; i++) {
  console.log("run", i + 1);
  run();
}
