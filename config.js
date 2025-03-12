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
    TABLE_RUN: 10,
    JUDGING_SESSION: 25,
    JUDGING_BREAK: 10,
    LUNCH_DURATION: 45,
  },

  // Timing configuration
  TIMING: {
    LUNCH_START_TIME: 150,

    // Time offsets for tables (to stagger starts)
    TABLE_OFFSETS: [0, 0, 5, 5],

    // Time offsets for judging rooms (to stagger starts)
    JUDGING_OFFSETS: [0, 5, 10, 15, 0, 5, 10, 15],
  },

  // Event types
  EVENT_TYPES: {
    TABLE_RUN: "tableRun",
    PROJECT_JUDGING: "projectJudging",
    ROBOT_JUDGING: "robotJudging",
  },

  // Genetic algorithm parameters
  GENETIC: {
    POPULATION_SIZE: 100,
    GENERATIONS: 20,
    MUTATION_PROBABILITY: 0.1,
    MUTATIONS_PER_SCHEDULE: 5,
    ELITE_PERCENTAGE: 0.2,
  },

  // Debugging
  DEBUG: false,
};

export default CONFIG;
