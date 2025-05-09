/**
 * FLL Competition Scheduler Configuration
 *
 * This file contains all configurable parameters for the FLL competition scheduling system.
 * Adjust these values to match your specific tournament requirements.
 */

// Tournament configuration
const CONFIG = {
  // Number of teams participating in the tournament
  NUM_TEAMS: 32,

  // Number of robot game tables (typically in pairs)
  NUM_ROBOT_TABLES: 4,

  // Number of judging rooms (typically 2 types: project and robot design)
  NUM_JUDGING_ROOMS: 8,

  // Number of rounds each team should play at the robot game tables
  ROUNDS_PER_TEAM: 3,

  // Day bounds (minutes since 00:00)
  DAY_START: 8 * 60, // 8:00 AM
  DAY_END: 17 * 60, // 5:00 PM

  // Duration of events in minutes
  DURATIONS: {
    // Duration of a team's robot game run
    TABLE_RUN: 5,

    // Extra buffer time after table run
    TABLE_BUFFER: 2,

    // Duration of a judging session
    JUDGING_SESSION: 15,

    // Buffer time between judging sessions
    JUDGE_BUFFER: 3,

    // Duration of lunch break
    LUNCH_DURATION: 45,

    // Minimum transition time between events
    MIN_TRANSITION_TIME: 5,

    // Opening ceremony duration
    OPENING_CEREMONY: 20,

    // Closing ceremony duration
    CLOSING_CEREMONY: 30,
  },

  // Ceremonies and breaks
  CEREMONIES: {
    // Opening ceremony (start time in minutes from day start)
    OPENING_START: 0, // Starts at DAY_START

    // Lunch break (start time in minutes from day start)
    LUNCH_START: 210, // 11:30 AM (3.5 hours after 8:00 AM)

    // Closing ceremony (time slot at the end of the day)
    CLOSING_START: null, // Will be calculated based on schedule
  },

  // Event types
  EVENT_TYPES: {
    TABLE_RUN: "tableRun",
    PROJECT_JUDGING: "projectJudging",
    ROBOT_JUDGING: "robotJudging",
    LUNCH: "lunch",
    OPENING_CEREMONY: "openingCeremony",
    CLOSING_CEREMONY: "closingCeremony",
  },

  // Genetic algorithm parameters
  GENETIC: {
    POPULATION_SIZE: 20,
    GENERATIONS: 10,
    MUTATION_PROBABILITY: 0.2,
    MUTATIONS_PER_SCHEDULE: 3,
    ELITE_PERCENTAGE: 0.2,
  },

  // Debugging
  DEBUG: false,
};

// Validate configuration
function validateConfig() {
  // Check that all numeric parameters are positive
  if (CONFIG.NUM_TEAMS <= 0) throw new Error("NUM_TEAMS must be positive");
  if (CONFIG.NUM_ROBOT_TABLES <= 0)
    throw new Error("NUM_ROBOT_TABLES must be positive");
  if (CONFIG.NUM_JUDGING_ROOMS <= 0)
    throw new Error("NUM_JUDGING_ROOMS must be positive");
  if (CONFIG.ROUNDS_PER_TEAM <= 0)
    throw new Error("ROUNDS_PER_TEAM must be positive");
  if (CONFIG.DAY_START < 0) throw new Error("DAY_START must be non-negative");
  if (CONFIG.DAY_END <= CONFIG.DAY_START)
    throw new Error("DAY_END must be after DAY_START");

  // Check durations
  if (CONFIG.DURATIONS.TABLE_RUN <= 0)
    throw new Error("TABLE_RUN duration must be positive");
  if (CONFIG.DURATIONS.JUDGING_SESSION <= 0)
    throw new Error("JUDGING_SESSION duration must be positive");
  if (CONFIG.DURATIONS.LUNCH_DURATION <= 0)
    throw new Error("LUNCH_DURATION must be positive");

  // Check lunch time
  const lunchStart = CONFIG.DAY_START + CONFIG.CEREMONIES.LUNCH_START;
  const lunchEnd = lunchStart + CONFIG.DURATIONS.LUNCH_DURATION;

  if (lunchStart < CONFIG.DAY_START || lunchEnd > CONFIG.DAY_END) {
    throw new Error("Lunch break must be within day bounds");
  }

  // Ensure we have enough time in the day for all teams
  const minRequiredTime = estimateMinimumRequiredTime();
  if (CONFIG.DAY_START + minRequiredTime > CONFIG.DAY_END) {
    throw new Error("Day bounds are not sufficient for the required events");
  }
}

/**
 * Estimate the minimum time required for all teams to complete their events
 * This is a rough estimation to validate config
 */
function estimateMinimumRequiredTime() {
  // Opening ceremony
  const openingTime = CONFIG.DURATIONS.OPENING_CEREMONY;

  // Lunch
  const lunchTime = CONFIG.DURATIONS.LUNCH_DURATION;

  // Closing ceremony
  const closingTime = CONFIG.DURATIONS.CLOSING_CEREMONY;

  // Estimate time for all table runs
  const totalTableEvents = CONFIG.NUM_TEAMS * CONFIG.ROUNDS_PER_TEAM;
  const tableRunsPerBatch = CONFIG.NUM_ROBOT_TABLES;
  const tableBatches = Math.ceil(totalTableEvents / tableRunsPerBatch);
  const tableTime =
    tableBatches * (CONFIG.DURATIONS.TABLE_RUN + CONFIG.DURATIONS.TABLE_BUFFER);

  // Estimate time for all judging sessions
  const judgingEventsPerType = CONFIG.NUM_TEAMS;
  const judgingSessionsPerBatch = CONFIG.NUM_JUDGING_ROOMS / 2; // Split between project and robot judging
  const judgingBatches = Math.ceil(
    judgingEventsPerType / judgingSessionsPerBatch
  );
  const judgingTime =
    judgingBatches *
    (CONFIG.DURATIONS.JUDGING_SESSION + CONFIG.DURATIONS.JUDGE_BUFFER);

  // Combine for total estimate (assuming some parallelism)
  return (
    openingTime + Math.max(tableTime, judgingTime) + lunchTime + closingTime
  );
}

// Run validation on import
validateConfig();

export default CONFIG;
