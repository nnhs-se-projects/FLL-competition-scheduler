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

  // Duration of events in minutes
  DURATIONS: {
    // Duration of a team's robot game run
    TABLE_RUN: 5,

    // Duration of a judging session
    JUDGING_SESSION: 20,

    // Break time between judging sessions
    JUDGING_BREAK: 5,

    // Duration of lunch break
    LUNCH_DURATION: 45,

    // Minimum transition time between events
    MIN_TRANSITION_TIME: 5,
  },

  // Timing configuration
  TIMING: {
    // Start time in minutes from midnight (9:00 AM = 540 minutes)
    START_TIME: 540,

    // Standard break between consecutive events
    STANDARD_BREAK: 5,

    // Morning start time offset in minutes from schedule start
    MORNING_START_TIME: 0,

    // Lunch start time offset in minutes from schedule start (12:00 PM = 180 minutes from 9:00 AM)
    LUNCH_START_TIME: 180,

    // Time offsets for tables (to minimize gaps, not stagger starts)
    TABLE_OFFSETS: [0, 0, 0, 0],

    // Time offsets for judging rooms (to minimize gaps, not stagger starts)
    JUDGING_OFFSETS: [0, 0, 0, 0, 0, 0, 0, 0],
  },

  // Event types
  EVENT_TYPES: {
    TABLE_RUN: "tableRun",
    PROJECT_JUDGING: "projectJudging",
    ROBOT_JUDGING: "robotJudging",
  },

  // Opening ceremony configuration
  OPENING_CEREMONY: {
    ENABLED: true,
    START_TIME: 0, // Start at 9:00 AM (0 minutes from schedule start)
    DURATION: 15, // 15 minutes opening ceremony
  },

  // Genetic algorithm parameters
  GENETIC: {
    POPULATION_SIZE: 100,
    GENERATIONS: 30,
    MUTATION_PROBABILITY: 0.1,
    MUTATIONS_PER_SCHEDULE: 5,
    ELITE_PERCENTAGE: 0.2,
  },

  // Debugging
  DEBUG: false,
};

export default CONFIG;
