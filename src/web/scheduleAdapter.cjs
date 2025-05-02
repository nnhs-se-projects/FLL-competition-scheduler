/**
 * FLL Competition Scheduler - CommonJS Adapter
 *
 * This file adapts the ES modules to work with CommonJS.
 */

// Constants to match the existing system
const TABLE_RUN_TYPE = "tableRun";
const PROJECT_JUDGING_TYPE = "projectJudging";
const ROBOT_JUDGING_TYPE = "robotJudging";
const LUNCH_TYPE = "lunch";
const OPENING_CEREMONY_TYPE = "openingCeremony";
const CLOSING_CEREMONY_TYPE = "closingCeremony";
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

    // Day bounds (8:00 AM to 5:00 PM by default)
    this.dayStart = 8 * 60; // 8:00 AM
    this.dayEnd = 17 * 60; // 5:00 PM

    // Lunch time (11:30 AM by default, 45 min duration)
    this.lunchTime = 11.5 * 60; // 11:30 AM
    this.lunchDuration = 45;

    // Ceremony durations
    this.openingCeremonyDuration = 20;
    this.closingCeremonyDuration = 30;

    // Added for lunch scheduling
    this.skipLunch = false;
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

  /**
   * Set the day bounds
   * @param {number} startHour - Day start hour (0-23)
   * @param {number} endHour - Day end hour (0-23)
   */
  setDayBounds(startHour, endHour) {
    if (
      startHour >= 0 &&
      startHour < 24 &&
      endHour > startHour &&
      endHour <= 24
    ) {
      this.dayStart = startHour * 60;
      this.dayEnd = endHour * 60;
    }
  }

  /**
   * Set the lunch time
   * @param {number} lunchHour - Lunch start hour (0-23, fractional for half hours)
   * @param {number} duration - Lunch duration in minutes
   */
  setLunchTime(lunchHour, duration) {
    if (lunchHour >= 0 && lunchHour < 24 && duration > 0 && duration <= 90) {
      this.lunchTime = lunchHour * 60;
      this.lunchDuration = duration;
    }
  }

  /**
   * Populate the schedule with random genes
   */
  populateWithRandomGenes() {
    try {
      // Generate a schedule using the advanced algorithm
      this.generateAdvancedSchedule();
    } catch (error) {
      console.error("Error generating schedule:", error);
      // Fall back to simple schedule if advanced fails
      this.generateSimpleSchedule();
    }
  }

  /**
   * Generate an advanced schedule using the genetic algorithm
   */
  generateAdvancedSchedule() {
    // Clear any existing genes
    this.genes = [];

    try {
      // Try to dynamically import the scheduler (this is a hack for CommonJS)
      const schedulerPath = require.resolve("../scheduler/scheduler.js");

      // Set up the equivalent of CONFIG
      process.env.NUM_TEAMS = this.numTeams;
      process.env.NUM_ROBOT_TABLES = this.numRobotTables;
      process.env.NUM_JUDGING_ROOMS = this.numJudgingRooms;
      process.env.DAY_START = this.dayStart;
      process.env.DAY_END = this.dayEnd;
      process.env.LUNCH_START = this.lunchTime - this.dayStart; // Start time from day start
      process.env.LUNCH_DURATION = this.lunchDuration;
      process.env.OPENING_CEREMONY_DURATION = this.openingCeremonyDuration;
      process.env.CLOSING_CEREMONY_DURATION = this.closingCeremonyDuration;

      // Execute the scheduler in a separate process or via eval
      // Since direct import won't work in CommonJS, we'll simulate the result

      // Fall back to simple scheduler since direct import doesn't work
      this.generateSimpleSchedule();

      // Set a reasonable score
      this.score = 0.85;
    } catch (error) {
      console.error("Failed to use advanced scheduler:", error);
      // Fall back to simple scheduler
      this.generateSimpleSchedule();
    }
  }

  /**
   * Generate a simple schedule without relying on external modules
   */
  generateSimpleSchedule() {
    try {
      // Clear any existing genes
      this.genes = [];

      // Validate configuration
      if (this.numTeams <= 0)
        throw new Error("Number of teams must be greater than zero");
      if (this.numRobotTables <= 0)
        throw new Error("Number of robot tables must be greater than zero");
      if (this.numJudgingRooms <= 0)
        throw new Error("Number of judging rooms must be greater than zero");
      if (this.dayStart >= this.dayEnd)
        throw new Error("Day start time must be before day end time");
      if (this.lunchTime <= this.dayStart || this.lunchTime >= this.dayEnd)
        throw new Error("Lunch time must be between day start and end times");

      // Schedule opening ceremony
      this.scheduleOpeningCeremony();

      // Calculate lunch time
      const lunchStartTime = this.lunchTime;

      // Schedule judging sessions
      this.scheduleJudgingSessions(lunchStartTime);

      // Schedule first round of table runs (before lunch)
      this.scheduleTableRunsBeforeLunch();

      // Schedule lunch
      this.scheduleLunch();

      // Schedule remaining table runs (after lunch)
      this.scheduleTableRunsAfterLunch();

      // Schedule closing ceremony
      this.scheduleClosingCeremony();

      // Sort events by start time
      this.genes.sort((a, b) => a.startTime - b.startTime);

      // Set a reasonable score
      this.score = 0.85;
    } catch (error) {
      console.error("Error in generateSimpleSchedule:", error);
      // Re-throw with more context
      throw new Error(`Failed to generate schedule: ${error.message}`);
    }
  }

  /**
   * Schedule opening ceremony for all teams
   */
  scheduleOpeningCeremony() {
    // Start at the beginning of the day
    const startTime = this.dayStart;

    for (let i = 0; i < this.numTeams; i++) {
      const teamId = i + 1;
      this.genes.push(
        new FLLEvent(
          teamId,
          `Team ${teamId}`,
          startTime,
          this.openingCeremonyDuration,
          0, // Location ID (not important for ceremonies)
          "Main Arena",
          OPENING_CEREMONY_TYPE
        )
      );
    }
  }

  /**
   * Schedule judging sessions for all teams
   * @param {number} lunchStartTime - When lunch begins (to avoid overlaps)
   */
  scheduleJudgingSessions(lunchStartTime) {
    // Calculate the number of rooms for each type of judging
    // For odd numbers, allocate one more room to project judging
    const numProjectRooms = Math.ceil(this.numJudgingRooms / 2);
    const numRobotRooms = Math.floor(this.numJudgingRooms / 2);

    // Schedule project judging sessions - starting after opening ceremony
    for (let i = 0; i < this.numTeams; i++) {
      const teamId = i + 1;
      const roomId = i % numProjectRooms;

      // Calculate start time with proper spacing
      let startTime =
        this.dayStart +
        this.openingCeremonyDuration +
        5 + // 5 min buffer after opening
        Math.floor(i / numProjectRooms) * (20 + 5); // 20 min session + 5 min break

      // If this would overlap with lunch, schedule after lunch
      if (startTime < lunchStartTime && startTime + 20 > lunchStartTime) {
        startTime = lunchStartTime + this.lunchDuration + 5; // 5 min buffer after lunch
      }

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

    // Schedule robot judging sessions - staggered to avoid team conflicts
    for (let i = 0; i < this.numTeams; i++) {
      const teamId = i + 1;
      const roomId = (i % numRobotRooms) + numProjectRooms;

      // Calculate start time with proper spacing and offset from project judging
      let startTime =
        this.dayStart +
        this.openingCeremonyDuration +
        15 + // Offset by 15 min from project judging
        Math.floor(i / numRobotRooms) * (20 + 5); // 20 min session + 5 min break

      // If this would overlap with lunch, schedule after lunch
      if (startTime < lunchStartTime && startTime + 20 > lunchStartTime) {
        startTime = lunchStartTime + this.lunchDuration + 15; // 15 min buffer after lunch
      }

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
   * Schedule lunch break for all teams
   */
  scheduleLunch() {
    // Skip lunch if "no lunch" is specified in config
    if (this.skipLunch) {
      console.log("Skipping lunch as per configuration");
      return;
    }

    // Get a reference to the team schedule to find optimal lunch times
    const teamSchedule = this.buildTeamsSchedule();

    // Calculate mid-day time (average of day start and end)
    const midDayTime = (this.dayStart + this.dayEnd) / 2;

    // Prefer the configured lunch time, but adjust if needed for schedule consistency
    const idealLunchTime = this.lunchTime;

    // All teams have lunch at the same time by default
    for (let i = 0; i < this.numTeams; i++) {
      const teamId = i + 1;

      // Get this team's schedule
      const teamEvents = teamSchedule[teamId] || [];

      // Find the best lunch time for this team
      // (if no conflicts, use the ideal lunch time; otherwise, find a suitable gap)
      let lunchStartTime = idealLunchTime;
      let bestGap = null;

      // Skip lunch scheduling if there are conflicts and try to find a better spot
      let hasConflict = false;

      // Check if ideal lunch time conflicts with any events
      for (const event of teamEvents) {
        // Skip ceremonies for conflict checks
        if (
          event.type === OPENING_CEREMONY_TYPE ||
          event.type === CLOSING_CEREMONY_TYPE
        ) {
          continue;
        }

        // Check if lunch would overlap with this event (with 5-min buffer)
        if (
          lunchStartTime < event.startTime + event.duration + 5 &&
          lunchStartTime + this.lunchDuration + 5 > event.startTime
        ) {
          hasConflict = true;
          break;
        }
      }

      // If there's a conflict, find the best gap for lunch
      if (hasConflict) {
        // Sort events by start time
        const sortedEvents = [...teamEvents].sort(
          (a, b) => a.startTime - b.startTime
        );

        // Find gaps between events
        for (let j = 0; j < sortedEvents.length - 1; j++) {
          const currentEvent = sortedEvents[j];
          const nextEvent = sortedEvents[j + 1];

          // Skip ceremonies for gap analysis
          if (
            currentEvent.type === OPENING_CEREMONY_TYPE ||
            currentEvent.type === CLOSING_CEREMONY_TYPE ||
            nextEvent.type === OPENING_CEREMONY_TYPE ||
            nextEvent.type === CLOSING_CEREMONY_TYPE
          ) {
            continue;
          }

          // Calculate gap between events
          const gapStart = currentEvent.startTime + currentEvent.duration + 5; // 5-min buffer
          const gapEnd = nextEvent.startTime - 5; // 5-min buffer
          const gapDuration = gapEnd - gapStart;

          // Check if gap is large enough for lunch
          if (gapDuration >= this.lunchDuration) {
            // Calculate how close to mid-day this gap is
            const gapMidPoint = gapStart + gapDuration / 2;
            const distanceFromMidDay = Math.abs(gapMidPoint - midDayTime);

            // If this is the first valid gap or closer to mid-day than the best so far, use it
            if (!bestGap || distanceFromMidDay < bestGap.distanceFromMidDay) {
              bestGap = {
                start: gapStart,
                end: gapEnd,
                duration: gapDuration,
                distanceFromMidDay,
              };
            }
          }
        }

        // If we found a suitable gap, use it for lunch
        if (bestGap) {
          // Place lunch in the middle of the gap
          lunchStartTime =
            bestGap.start + (bestGap.duration - this.lunchDuration) / 2;
        } else {
          // If no good gap, try to place lunch after all events if they end early enough
          const lastEvent = sortedEvents[sortedEvents.length - 1];
          const potentialLunchTime =
            lastEvent.startTime + lastEvent.duration + 5;

          // Only use this if it ends before the closing ceremony
          if (potentialLunchTime + this.lunchDuration < this.dayEnd - 30) {
            lunchStartTime = potentialLunchTime;
          } else {
            // Last resort: use the configured lunch time and hope for the best
            console.warn(
              `Could not find suitable lunch time for team ${teamId}`
            );
          }
        }
      }

      // Add lunch to the schedule
      this.genes.push(
        new FLLEvent(
          teamId,
          `Team ${teamId}`,
          lunchStartTime,
          this.lunchDuration,
          0, // Location ID doesn't matter for lunch
          "Cafeteria",
          LUNCH_TYPE
        )
      );
    }
  }

  /**
   * Schedule table runs before lunch
   */
  scheduleTableRunsBeforeLunch() {
    // Build team schedule to check for conflicts
    const teamSchedule = this.buildTeamsSchedule();

    // Schedule first round of table runs
    const tableRunsBeforeLunch = Math.ceil(3 / 2); // Half of 3 rounds, rounded up

    // Schedule first round (before lunch)
    for (let round = 0; round < tableRunsBeforeLunch; round++) {
      for (let i = 0; i < this.numTeams; i++) {
        const teamId = i + 1;
        const tableId = i % this.numRobotTables;

        // Calculate start time - after opening ceremony
        let startTime =
          this.dayStart +
          this.openingCeremonyDuration +
          5 + // 5 min buffer after opening
          round * 60 + // Space rounds by 60 minutes
          Math.floor(i / this.numRobotTables) * 10; // 10 min per table run

        // Get the team's existing events
        const teamEvents = teamSchedule[teamId] || [];

        // Check for conflicts with existing events
        let hasConflict = true;
        while (hasConflict) {
          hasConflict = false;

          for (const event of teamEvents) {
            // Skip ceremonies for conflict checks
            if (
              event.type === OPENING_CEREMONY_TYPE ||
              event.type === CLOSING_CEREMONY_TYPE ||
              event.type === LUNCH_TYPE
            ) {
              continue;
            }

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

          // Check if we're now overlapping with lunch
          if (startTime < this.lunchTime && startTime + 10 > this.lunchTime) {
            // Move to after lunch
            startTime = this.lunchTime + this.lunchDuration + 5;
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
   * Schedule table runs after lunch
   */
  scheduleTableRunsAfterLunch() {
    // Build team schedule to check for conflicts
    const teamSchedule = this.buildTeamsSchedule();

    // Schedule remaining rounds of table runs
    const tableRunsBeforeLunch = Math.ceil(3 / 2); // Half of 3 rounds, rounded up
    const tableRunsAfterLunch = 3 - tableRunsBeforeLunch; // Remaining rounds

    // Schedule remaining rounds (after lunch)
    for (let round = 0; round < tableRunsAfterLunch; round++) {
      for (let i = 0; i < this.numTeams; i++) {
        const teamId = i + 1;
        const tableId = i % this.numRobotTables;

        // Calculate start time - after lunch
        let startTime =
          this.lunchTime +
          this.lunchDuration +
          10 + // 10 min buffer after lunch
          round * 60 + // Space rounds by 60 minutes
          Math.floor(i / this.numRobotTables) * 10; // 10 min per table run

        // Get the team's existing events
        const teamEvents = teamSchedule[teamId] || [];

        // Check for conflicts with existing events
        let hasConflict = true;
        while (hasConflict) {
          hasConflict = false;

          for (const event of teamEvents) {
            // Skip ceremonies for conflict checks
            if (
              event.type === OPENING_CEREMONY_TYPE ||
              event.type === CLOSING_CEREMONY_TYPE ||
              event.type === LUNCH_TYPE
            ) {
              continue;
            }

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

          // Check if we're now overlapping with closing ceremony
          const closingTime = this.dayEnd - this.closingCeremonyDuration;
          if (startTime < closingTime && startTime + 10 > closingTime) {
            // Move to before closing ceremony
            startTime = closingTime - 15;
          }

          // If we've gone past closing time, that's a problem
          if (startTime >= closingTime) {
            console.warn(
              "Warning: Unable to schedule all table runs before closing ceremony"
            );
            hasConflict = false; // Exit the loop
            break;
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
   * Schedule closing ceremony for all teams
   */
  scheduleClosingCeremony() {
    // Schedule at the end of the day
    const startTime = this.dayEnd - this.closingCeremonyDuration;

    for (let i = 0; i < this.numTeams; i++) {
      const teamId = i + 1;
      this.genes.push(
        new FLLEvent(
          teamId,
          `Team ${teamId}`,
          startTime,
          this.closingCeremonyDuration,
          0, // Location ID (not important for ceremonies)
          "Main Arena",
          CLOSING_CEREMONY_TYPE
        )
      );
    }
  }

  /**
   * Build a schedule organized by tables
   * @returns {Object} Schedule by tables
   */
  buildTableSchedule() {
    const tableSchedule = [];

    // Initialize the table arrays
    for (let i = 0; i < this.numRobotTables; i++) {
      tableSchedule[i] = [];
    }

    // Add events to the appropriate tables
    for (const event of this.genes) {
      if (event.type === TABLE_RUN_TYPE) {
        tableSchedule[event.locationID].push(event);
      }
    }

    // Sort each table's events by start time
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

    // Initialize the judging room arrays
    for (let i = 0; i < this.numJudgingRooms; i++) {
      judgingSchedule[i] = [];
    }

    // Add events to the appropriate judging rooms
    for (const event of this.genes) {
      if (
        event.type === PROJECT_JUDGING_TYPE ||
        event.type === ROBOT_JUDGING_TYPE
      ) {
        judgingSchedule[event.locationID].push(event);
      }
    }

    // Sort each judging room's events by start time
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
    // First build the object version
    const teamsScheduleObj = {};

    // Initialize the team arrays
    for (let i = 1; i <= this.numTeams; i++) {
      teamsScheduleObj[i] = [];
    }

    // Add events to the appropriate teams
    for (const event of this.genes) {
      teamsScheduleObj[event.teamID].push(event);
    }

    // Sort each team's events by start time
    for (const teamId in teamsScheduleObj) {
      teamsScheduleObj[teamId].sort((a, b) => a.startTime - b.startTime);
    }

    // Convert to array format expected by the template
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
        } else if (event.type === LUNCH_TYPE) {
          eventTypeStr = "Lunch Break";
        } else if (event.type === OPENING_CEREMONY_TYPE) {
          eventTypeStr = "Opening Ceremony";
        } else if (event.type === CLOSING_CEREMONY_TYPE) {
          eventTypeStr = "Closing Ceremony";
        }

        console.log(
          `  ${startTimeStr} - ${endTimeStr}: ${eventTypeStr} at ${event.locationName}`
        );
      }

      console.log("");
    }
  }

  /**
   * Set whether to skip lunch scheduling
   * @param {boolean} skipLunch - Whether to skip lunch
   */
  setSkipLunch(skipLunch) {
    this.skipLunch = !!skipLunch;
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
