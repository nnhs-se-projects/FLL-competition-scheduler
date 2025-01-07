import { createFullSchedule } from "../fullRandomSchedule.js";

const NUM_TEAMS = 32;
const NUM_ROBOT_TABLES = 4;
const NUM_JUDGING_ROOMS = 8;
const TABLE_RUN_TYPE = "tableRun";
const PROJECT_JUDGING_TYPE = "projectJudging";
const ROBOT_JUDGING_TYPE = "robotJudging";
const DEBUG = true;
const JUDGING_ROOM_BREAK_MINUTES = 10;
const LUNCH_START_TIME = 150;
const LUNCH_DURATION = 45;

const TABLE_RUN_TIMING_CONFIG = [
  { start: 0, duration: 10 },
  { start: 0, duration: 10 },
  { start: 5, duration: 10 },
  { start: 5, duration: 10 },
];

const JUDGING_ROOM_TIMING_CONFIG = [
  { start: 0, duration: 25 },
  { start: 5, duration: 25 },
  { start: 10, duration: 25 },
  { start: 15, duration: 25 },
  { start: 0, duration: 25 },
  { start: 5, duration: 25 },
  { start: 10, duration: 25 },
  { start: 15, duration: 25 },
];

class FLLSchedule {
  constructor() {
    this.genes = [];
    this.score = 0;
    this.mutationProbability = 0.1;
    this.numberOfPotentialMutations = 5;
  }

  populateWithRandomGenes() {
    const schedule = createFullSchedule();
    const tableSchedule = schedule[0];
    const judgingSchedule = schedule[1];

    for (let i = 0; i < tableSchedule.length; i++) {
      for (let j = 0; j < tableSchedule[i].length; j++) {
        this.genes.push(
          new Event(
            tableSchedule[i][j].id,
            tableSchedule[i][j].name,
            tableSchedule[i][j].start,
            tableSchedule[i][j].duration,
            i,
            "table " + i,
            TABLE_RUN_TYPE
          )
        );
      }
    }

    for (let i = 0; i < judgingSchedule.length; i++) {
      for (let j = 0; j < judgingSchedule[i].length; j++) {
        this.genes.push(
          new Event(
            judgingSchedule[i][j].id,
            judgingSchedule[i][j].name,
            judgingSchedule[i][j].startT,
            judgingSchedule[i][j].duration,
            i,
            "judging room " + i,
            judgingSchedule[i][j].type === "robot"
              ? ROBOT_JUDGING_TYPE
              : PROJECT_JUDGING_TYPE
          )
        );
      }
    }

    this.genes.sort((a, b) => a.startTime - b.startTime);

    this.updateScore();
  }

  createCopy() {
    const copy = new FLLSchedule();
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

  getGeneAtIndex(index) {
    return this.genes[index];
  }

  replaceGenesInRange(start, end, genes) {
    this.genes.splice(start, end - start, ...genes);
  }

  replaceGeneAtIndex(index, gene) {
    this.genes[index] = gene;
  }

  updateScore() {
    const currentTableScheduleTimes = [];
    const currentJudgingScheduleTimes = [];
    for (let i = 0; i < TABLE_RUN_TIMING_CONFIG.length; i++) {
      currentTableScheduleTimes.push(TABLE_RUN_TIMING_CONFIG[i].start);
    }
    for (let i = 0; i < JUDGING_ROOM_TIMING_CONFIG.length; i++) {
      currentJudgingScheduleTimes.push(JUDGING_ROOM_TIMING_CONFIG[i].start);
    }

    for (let i = 0; i < this.genes.length; i++) {
      if (this.genes[i].type === TABLE_RUN_TYPE) {
        const tableIndex = this.genes[i].locationID;

        // account for lunch break while honoring the time offsets between tables
        if (
          currentTableScheduleTimes[tableIndex] +
            TABLE_RUN_TIMING_CONFIG[tableIndex].duration >
            LUNCH_START_TIME &&
          currentTableScheduleTimes[tableIndex] <
            LUNCH_START_TIME + LUNCH_DURATION
        ) {
          currentTableScheduleTimes[tableIndex] =
            LUNCH_START_TIME +
            LUNCH_DURATION +
            TABLE_RUN_TIMING_CONFIG[tableIndex].start;
        }

        this.genes[i].startTime = currentTableScheduleTimes[tableIndex];
        currentTableScheduleTimes[tableIndex] +=
          TABLE_RUN_TIMING_CONFIG[tableIndex].duration;
      } else {
        const judgingRoomIndex = this.genes[i].locationID;

        // account for lunch break while honoring the time offsets between judging rooms
        if (
          currentJudgingScheduleTimes[judgingRoomIndex] +
            JUDGING_ROOM_TIMING_CONFIG[judgingRoomIndex].duration >
            LUNCH_START_TIME &&
          currentJudgingScheduleTimes[judgingRoomIndex] <
            LUNCH_START_TIME + LUNCH_DURATION
        ) {
          currentJudgingScheduleTimes[judgingRoomIndex] =
            LUNCH_START_TIME +
            LUNCH_DURATION +
            JUDGING_ROOM_TIMING_CONFIG[judgingRoomIndex].start;
        }

        this.genes[i].startTime = currentJudgingScheduleTimes[judgingRoomIndex];
        currentJudgingScheduleTimes[judgingRoomIndex] +=
          JUDGING_ROOM_TIMING_CONFIG[judgingRoomIndex].duration;
      }
    }

    this.genes.sort((a, b) => a.startTime - b.startTime);

    const tableSchedule = this.buildTableSchedule();
    const judgingSchedule = this.buildJudgingSchedule();
    const teamsSchedule = this.buildTeamsSchedule();

    // extra checks when debugging
    if (DEBUG) {
      // iterate through each table
      for (let i = 0; i < tableSchedule.length; i++) {
        tableSchedule[i].sort((a, b) => a.startTime - b.startTime);
        // iterate through each table run at the table
        for (let j = 0; j < tableSchedule[i].length - 1; j++) {
          if (
            tableSchedule[i][j].startTime + tableSchedule[i][j].duration >
            tableSchedule[i][j + 1].startTime
          ) {
            // console.log(this.genes);
            // console.log("Table " + i + " has overlapping table runs");
            this.score = 0.0;
            return;
          }
        }
      }

      // iterate through each judging room
      for (let i = 0; i < judgingSchedule.length; i++) {
        judgingSchedule[i].sort((a, b) => a.startTime - b.startTime);
        // iterate through each team in the judging room
        for (let j = 0; j < judgingSchedule[i].length - 1; j++) {
          if (
            judgingSchedule[i][j].startTime +
              judgingSchedule[i][j].duration +
              JUDGING_ROOM_BREAK_MINUTES >
            judgingSchedule[i][j + 1].startTime
          ) {
            // console.log(this.genes);
            // console.log(
            //   "Judging room " + i + " has overlapping judging sessions"
            // );
            this.score = 0.0;
            return;
          }
        }
      }
    }

    // check that each team is scheduled for 3 table runs and 2 judging sessions
    for (let i = 1; i <= NUM_TEAMS; i++) {
      let tableRunCount = 0;
      let projectJudgingCount = 0;
      let robotJudgingCount = 0;
      for (const event of teamsSchedule[i]) {
        if (event.type === TABLE_RUN_TYPE) {
          tableRunCount++;
        } else if (event.type === PROJECT_JUDGING_TYPE) {
          projectJudgingCount++;
        } else {
          robotJudgingCount++;
        }
      }
      if (tableRunCount !== 3) {
        // console.log(this.genes);
        // console.log("Team " + i + " is not scheduled for 3 table runs");
        this.score = 0.0;
        return;
      }
      if (projectJudgingCount !== 1) {
        // console.log(this.genes);
        // console.log(
        //   "Team " + i + " is not scheduled for a project judging sessions"
        // );
        this.score = 0.0;
        return;
      }
      if (robotJudgingCount !== 1) {
        // console.log(this.genes);
        // console.log(
        //   "Team " + i + " is not scheduled for a robot judging sessions"
        // );
        this.score = 0.0;
        return;
      }
    }

    // check that no two events for a team overlap
    for (let i = 1; i <= NUM_TEAMS; i++) {
      const teamSchedule = teamsSchedule[i];
      teamSchedule.sort((a, b) => a.startTime - b.startTime);
      for (let j = 0; j < teamSchedule.length - 1; j++) {
        // due to deliberation time, teams will have at least 10 minutes after a judging session
        // however, we need to ensure that teams have at least 10 minutes after a table run
        let extraTime = 0;
        if (teamSchedule[j].type === TABLE_RUN_TYPE) {
          extraTime = 10;
        }
        if (
          teamSchedule[j].startTime + teamSchedule[j].duration + extraTime >
          teamSchedule[j + 1].startTime
        ) {
          // console.log(this.genes);
          // console.log("Team " + i + " has overlapping events");
          this.score = 0.0;
          return;
        }
      }
    }

    // score based on the time between a team's scheduled events
    // we want to optimize for a reasonable time between events and a consistent time between events
    // we will consider 50 minutes between events to be ideal and worth 0.25 points per interval
    // for a total of 1.0 points per team
    let score = 0.0;

    for (let i = 1; i <= NUM_TEAMS; i++) {
      const teamSchedule = teamsSchedule[i];
      for (let j = 0; j < teamSchedule.length - 1; j++) {
        const duration =
          teamSchedule[j + 1].startTime -
          (teamSchedule[j].startTime + teamSchedule[j].duration);
        score += 0.25 * (Math.min(duration, 50) / 50.0);
      }
    }

    this.score = score / NUM_TEAMS;
  }

  printSchedule() {
    const tableSchedule = this.buildTableSchedule();
    const judgingSchedule = this.buildJudgingSchedule();
    const teamsSchedule = this.buildTeamsSchedule();

    console.log("Table Schedule:");
    for (let i = 0; i < tableSchedule.length; i++) {
      console.log("Table " + i + ":");
      for (let j = 0; j < tableSchedule[i].length; j++) {
        console.log(tableSchedule[i][j]);
      }
    }

    console.log("Judging Schedule:");
    for (let i = 0; i < judgingSchedule.length; i++) {
      console.log("Judging Room " + i + ":");
      for (let j = 0; j < judgingSchedule[i].length; j++) {
        console.log(judgingSchedule[i][j]);
      }
    }

    console.log("Teams Schedule:");
    for (let i = 1; i <= NUM_TEAMS; i++) {
      console.log("Team " + i + ":");
      for (let j = 0; j < teamsSchedule[i].length; j++) {
        console.log(teamsSchedule[i][j]);
      }
    }
  }

  buildTableSchedule() {
    const tableSchedule = [];
    for (let i = 0; i < NUM_ROBOT_TABLES; i++) {
      tableSchedule.push([]);
    }

    for (const event of this.genes) {
      if (event.type === TABLE_RUN_TYPE) {
        tableSchedule[event.locationID].push(event);
      }
    }

    return tableSchedule;
  }

  buildJudgingSchedule() {
    const judgingSchedule = [];
    for (let i = 0; i < NUM_JUDGING_ROOMS; i++) {
      judgingSchedule.push([]);
    }

    for (const event of this.genes) {
      if (
        event.type === ROBOT_JUDGING_TYPE ||
        event.type === PROJECT_JUDGING_TYPE
      ) {
        judgingSchedule[event.locationID].push(event);
      }
    }

    return judgingSchedule;
  }

  buildTeamsSchedule() {
    const teamsSchedule = [];
    for (let i = 0; i <= NUM_TEAMS; i++) {
      teamsSchedule.push([]);
    }

    for (const event of this.genes) {
      teamsSchedule[event.teamID].push(event);
    }

    return teamsSchedule;
  }
}

class Event {
  /*
   * properties:
   * ------------
   * teamID: unique integer identifier for the team assigned to the event starting at 0
   * teamName: the name of the team assigned to the event
   * startTime: the time the event starts in minutes since the start of the competition
   * duration: the duration of the event in minutes
   * locationID: unique integer identifier for the location of the event starting at 0
   * locationName: a descriptive name of the location of the event
   * type: the type of event (robotJudging, projectJudging, tableRun)
   */

  constructor(
    teamID,
    teamName,
    startTime,
    duration,
    locationID,
    locationName,
    type
  ) {
    this.teamID = teamID;
    this.teamName = teamName;
    this.startTime = startTime;
    this.duration = duration;
    this.locationID = locationID;
    this.locationName = locationName;
    this.type = type;
  }

  equals(otherEvent) {
    return (
      this.teamID === otherEvent.teamID &&
      this.teamName === otherEvent.teamName &&
      this.startTime === otherEvent.startTime &&
      this.duration === otherEvent.duration &&
      this.locationID === otherEvent.locationID &&
      this.locationName === otherEvent.locationName &&
      this.type === otherEvent.type
    );
  }

  copy() {
    return new Event(
      this.teamID,
      this.teamName,
      this.startTime,
      this.duration,
      this.locationID,
      this.locationName,
      this.type
    );
  }
}

export { FLLSchedule, Event };
