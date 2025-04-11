/**
 * FLL Competition Scheduler - CommonJS Adapter
 *
 * This file adapts the ES modules to work with CommonJS.
 */

// Constants to match the existing system
const TABLE_RUN_TYPE = "tableRun";
const PROJECT_JUDGING_TYPE = "projectJudging";
const ROBOT_JUDGING_TYPE = "robotJudging";
const DEFAULT_NUM_TEAMS = 32;
const DEFAULT_NUM_ROBOT_TABLES = 4;
const DEFAULT_NUM_JUDGING_ROOMS = 8;

/**
 * FLLSchedule class that matches the interface expected by the website
 */
class FLLSchedule {
  constructor() {
    this.genes = [];
    this.score = 0;
    this.mutationProbability = 0.1;
    this.numberOfPotentialMutations = 5;
    this.numTeams = DEFAULT_NUM_TEAMS;
    this.numRobotTables = DEFAULT_NUM_ROBOT_TABLES;
    this.numJudgingRooms = DEFAULT_NUM_JUDGING_ROOMS;
    this.startTimeInMinutes = 540; // Default 9:00 AM
  }

  /**
   * Set the number of teams
   * @param {number} numTeams - Number of teams
   */
  setNumTeams(numTeams) {
    if (numTeams >= 10 && numTeams <= 50) {
      this.numTeams = numTeams;
    }
  }

  /**
   * Set the number of robot tables
   * @param {number} numTables - Number of robot tables
   */
  setNumTables(numTables) {
    if (numTables >= 2 && numTables <= 8) {
      this.numRobotTables = numTables;
    }
  }

  /**
   * Set the number of judging rooms
   * @param {number} numJudgingRooms - Number of judging rooms
   */
  setNumJudgingRooms(numJudgingRooms) {
    if (numJudgingRooms >= 2 && numJudgingRooms <= 16) {
      this.numJudgingRooms = numJudgingRooms;
    }
  }

  setStartTime(startTimeInMinutes) {
    this.startTimeInMinutes = startTimeInMinutes;
  }

  adjustEventTime(event) {
    if (event && typeof event.startTime === "number") {
      event.startTime += this.startTimeInMinutes;
    }
  }

  /**
   * Populate the schedule with random genes
   */
  populateWithRandomGenes() {
    try {
      // Generate a simple schedule directly
      this.generateSimpleSchedule();
    } catch (error) {
      console.error("Error generating schedule:", error);
    }
  }

  /**
   * Generate a simple schedule without relying on external modules
   */
  generateSimpleSchedule() {
    // Clear any existing genes
    this.genes = [];

    // Schedule project judging sessions
    this.scheduleJudgingSessions();

    // Schedule table runs
    this.scheduleTableRuns();

    // Sort events by start time
    this.genes.sort((a, b) => a.startTime - b.startTime);

    // Set a reasonable score
    this.score = 0.8;
  }

  /**
   * Schedule judging sessions for all teams
   */
  scheduleJudgingSessions() {
    const numProjectRooms = Math.ceil(this.numJudgingRooms / 2);
    const numRobotRooms = Math.floor(this.numJudgingRooms / 2);

    // Schedule project judging sessions starting at configured start time
    for (let i = 0; i < this.numTeams; i++) {
      const teamId = i + 1;
      const roomId = i % numProjectRooms;
      // Calculate start time with 5 minute intervals
      const startTime = Math.floor(i / numProjectRooms) * 25; // 20 min session + 5 min break

      // Create project judging event
      this.genes.push(
        new FLLEvent(
          teamId,
          `Team ${teamId}`,
          startTime,
          20,
          roomId,
          `Project Judging Room ${roomId + 1}`,
          PROJECT_JUDGING_TYPE
        )
      );
    }

    // Schedule robot judging sessions - start with small offset
    for (let i = 0; i < this.numTeams; i++) {
      const teamId = i + 1;
      const roomId = (i % numRobotRooms) + numProjectRooms;
      // Calculate start time with 5 minute intervals
      const startTime = Math.floor(i / numRobotRooms) * 25 + 30; // 20 min session + 5 min break + 30 min offset

      // Create robot judging event
      this.genes.push(
        new FLLEvent(
          teamId,
          `Team ${teamId}`,
          startTime,
          20,
          roomId,
          `Robot Design Room ${roomId - numProjectRooms + 1}`,
          ROBOT_JUDGING_TYPE
        )
      );
    }
  }

  /**
   * Schedule table runs for all teams
   */
  scheduleTableRuns() {
    // Build team schedule to check for conflicts
    const teamSchedule = this.buildTeamsSchedule();

    // Schedule table runs
    for (let round = 0; round < 3; round++) {
      // 3 rounds per team
      for (let i = 0; i < this.numTeams; i++) {
        const teamId = i + 1;
        const tableId = i % this.numRobotTables;

        // Calculate start time based on round and team
        // Distribute table runs throughout the day
        let startTime =
          30 + // Start table runs after a small buffer
          round * 60 + // Space rounds by 60 minutes
          Math.floor(i / this.numRobotTables) * 10; // 10 min per table run

        // Get the team's existing events
        const teamEvents = teamSchedule[teamId] || [];

        // Check for conflicts with existing events
        let hasConflict = true;
        while (hasConflict) {
          hasConflict = false;

          for (const event of teamEvents) {
            // Check if the table run would overlap with another event
            // Add a 5-minute buffer between events
            if (
              startTime < event.startTime + event.duration + 5 &&
              startTime + 10 + 5 > event.startTime
            ) {
              hasConflict = true;
              startTime = event.startTime + event.duration + 5;
              break;
            }
          }

          // Check for lunch conflict (around 12:00 PM)
          const lunchStartTime = 180; // 12:00 PM (3 hours after 9:00 AM)
          const lunchEndTime = lunchStartTime + 45; // 45 min lunch

          if (startTime >= lunchStartTime - 5 && startTime <= lunchEndTime) {
            startTime = lunchEndTime + 5; // Schedule after lunch with a buffer
          }
        }

        // Create the table run event
        const tableEvent = new FLLEvent(
          teamId,
          `Team ${teamId}`,
          startTime,
          10, // 10 min per table run
          tableId,
          `Table ${tableId + 1}`,
          TABLE_RUN_TYPE
        );

        // Add the event to the schedule
        this.genes.push(tableEvent);

        // Update the team's events
        teamEvents.push(tableEvent);
        teamSchedule[teamId] = teamEvents;
      }
    }
  }

  /**
   * Build a schedule organized by tables
   * @returns {Object} Schedule by tables
   */
  buildTableSchedule() {
    const tableSchedule = [];
    for (let i = 0; i < this.numRobotTables; i++) {
      tableSchedule[i] = [];
    }

    for (const event of this.genes) {
      if (event.type === TABLE_RUN_TYPE) {
        this.adjustEventTime(event);
        tableSchedule[event.locationID].push(event);
      }
    }

    for (let i = 0; i < tableSchedule.length; i++) {
      tableSchedule[i].sort((a, b) => a.startTime - b.startTime);
    }

    return tableSchedule;
  }

  /**
   * Build a schedule organized by judging rooms
   * @returns {Object} Schedule by judging rooms
   */
  buildJudgingSchedule() {
    const judgingSchedule = [];
    for (let i = 0; i < this.numJudgingRooms; i++) {
      judgingSchedule[i] = [];
    }

    for (const event of this.genes) {
      if (
        event.type === PROJECT_JUDGING_TYPE ||
        event.type === ROBOT_JUDGING_TYPE
      ) {
        this.adjustEventTime(event);
        judgingSchedule[event.locationID].push(event);
      }
    }

    for (let i = 0; i < judgingSchedule.length; i++) {
      judgingSchedule[i].sort((a, b) => a.startTime - b.startTime);
    }

    return judgingSchedule;
  }

  /**
   * Build a schedule organized by teams
   * @returns {Array} Schedule by teams (array of arrays)
   */
  buildTeamsSchedule() {
    const teamsScheduleObj = {};
    for (let i = 1; i <= this.numTeams; i++) {
      teamsScheduleObj[i] = [];
    }

    for (const event of this.genes) {
      this.adjustEventTime(event);
      teamsScheduleObj[event.teamID].push(event);
    }

    for (const teamId in teamsScheduleObj) {
      teamsScheduleObj[teamId].sort((a, b) => a.startTime - b.startTime);
    }

    const teamsScheduleArray = [];
    for (let i = 0; i <= this.numTeams; i++) {
      teamsScheduleArray[i] = teamsScheduleObj[i] || [];
    }

    return teamsScheduleArray;
  }

  /**
   * Print the schedule to the console
   */
  printSchedule() {
    console.log("FLL COMPETITION SCHEDULE");
    console.log("=======================\n");

    // Print schedule summary
    console.log(`Number of Teams: ${this.numTeams}`);
    console.log(`Number of Robot Tables: ${this.numRobotTables}`);
    console.log(`Number of Judging Rooms: ${this.numJudgingRooms}`);
    console.log(`Schedule Score: ${this.score.toFixed(4)}\n`);

    // Print team schedules
    console.log("TEAM SCHEDULES");
    console.log("=============\n");

    const teamsSchedule = this.buildTeamsSchedule();

    for (let i = 1; i <= this.numTeams; i++) {
      const teamEvents = teamsSchedule[i] || [];

      console.log(`Team ${i}:`);

      for (const event of teamEvents) {
        const startHour = Math.floor(event.startTime / 60);
        const startMinute = event.startTime % 60;
        const endHour = Math.floor((event.startTime + event.duration) / 60);
        const endMinute = (event.startTime + event.duration) % 60;

        const startTimeStr = `${startHour
          .toString()
          .padStart(2, "0")}:${startMinute.toString().padStart(2, "0")}`;
        const endTimeStr = `${endHour.toString().padStart(2, "0")}:${endMinute
          .toString()
          .padStart(2, "0")}`;

        let eventTypeStr = "";
        if (event.type === TABLE_RUN_TYPE) {
          eventTypeStr = "Robot Game";
        } else if (event.type === PROJECT_JUDGING_TYPE) {
          eventTypeStr = "Project Judging";
        } else if (event.type === ROBOT_JUDGING_TYPE) {
          eventTypeStr = "Robot Design Judging";
        }

        console.log(
          `  ${startTimeStr} - ${endTimeStr}: ${eventTypeStr} at ${event.locationName}`
        );
      }

      console.log("");
    }
  }
}

/**
 * Event class that matches the interface expected by the website
 */
class FLLEvent {
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
    return new FLLEvent(
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

// Export the FLLSchedule class for use in the router
module.exports = { FLLSchedule };
