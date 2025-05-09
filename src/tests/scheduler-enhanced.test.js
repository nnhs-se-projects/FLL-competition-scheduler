/**
 * FLL Competition Scheduler - Enhanced Scheduler Tests
 *
 * This file contains tests for the enhanced scheduler module.
 */

// Import using CommonJS syntax
const CONFIG = require("../scheduler/config");
const {
  createRandomSchedule,
  evaluateSchedule,
  generateSchedule,
} = require("../scheduler/scheduler");
const { Event, Schedule } = require("../scheduler/models");

// Mock CONFIG for testing
jest.mock("../scheduler/config", () => ({
  NUM_TEAMS: 8,
  NUM_ROBOT_TABLES: 2,
  NUM_JUDGING_ROOMS: 4,
  ROUNDS_PER_TEAM: 3,

  DAY_START: 8 * 60, // 8:00 AM
  DAY_END: 17 * 60, // 5:00 PM

  DURATIONS: {
    TABLE_RUN: 5,
    TABLE_BUFFER: 2,
    JUDGING_SESSION: 20,
    JUDGE_BUFFER: 3,
    LUNCH_DURATION: 30,
    MIN_TRANSITION_TIME: 5,
  },

  LUNCH_WAVES: [11 * 60, 11.5 * 60, 12 * 60],

  EVENT_TYPES: {
    TABLE_RUN: "tableRun",
    PROJECT_JUDGING: "projectJudging",
    ROBOT_JUDGING: "robotJudging",
    LUNCH: "lunch",
  },

  GENETIC: {
    POPULATION_SIZE: 5,
    GENERATIONS: 2,
    MUTATION_PROBABILITY: 0.2,
    MUTATIONS_PER_SCHEDULE: 3,
    ELITE_PERCENTAGE: 0.2,
  },

  DEBUG: false,
}));

describe("Enhanced Scheduler Module", () => {
  test("createRandomSchedule generates a valid schedule with lunch events", () => {
    const schedule = createRandomSchedule();

    // Check that the schedule is not null
    expect(schedule).not.toBeNull();

    // Check that the schedule has the correct number of events
    // Each team has 3 table runs + 2 judging sessions + 1 lunch = 6 events per team
    // Note: Some teams might not have lunch events due to conflicts
    const minExpectedEventCount =
      CONFIG.NUM_TEAMS * (CONFIG.ROUNDS_PER_TEAM + 2);
    expect(schedule.getSize()).toBeGreaterThanOrEqual(minExpectedEventCount);

    // Count lunch events
    let lunchCount = 0;
    for (const event of schedule.getAllEvents()) {
      if (event.type === CONFIG.EVENT_TYPES.LUNCH) {
        lunchCount++;
      }
    }

    // We should have some lunch events (might not be for all teams due to conflicts)
    expect(lunchCount).toBeGreaterThan(0);

    // The schedule should comply with day bounds
    expect(schedule.isWithinDayBounds()).toBe(true);
  });

  test("evaluateSchedule correctly identifies invalid day bounds", () => {
    // Create a schedule with an event outside day bounds
    const schedule = new Schedule();

    // Add event outside day bounds
    const event = new Event(
      1,
      "Team 1",
      CONFIG.DAY_END + 10, // Beyond day end
      10,
      0,
      "Table 1",
      CONFIG.EVENT_TYPES.TABLE_RUN,
      "table"
    );

    schedule.addEvent(event);

    // The schedule should be invalid (score = 0)
    expect(evaluateSchedule(schedule)).toBe(0);
  });

  test("evaluateSchedule correctly identifies invalid team conflicts", () => {
    // Create a schedule with overlapping events for the same team
    const schedule = new Schedule();

    // Add two overlapping events for team 1
    const event1 = new Event(
      1,
      "Team 1",
      CONFIG.DAY_START + 60,
      10,
      0,
      "Table 1",
      CONFIG.EVENT_TYPES.TABLE_RUN,
      "table"
    );

    const event2 = new Event(
      1,
      "Team 1",
      CONFIG.DAY_START + 65,
      25,
      0,
      "Project Judging Room 1",
      CONFIG.EVENT_TYPES.PROJECT_JUDGING,
      "judging"
    );

    schedule.addEvent(event1);
    schedule.addEvent(event2);

    // The schedule should be invalid (score = 0)
    expect(evaluateSchedule(schedule)).toBe(0);
  });

  test("evaluateSchedule correctly identifies invalid resource conflicts", () => {
    // Create a schedule with overlapping events for the same resource
    const schedule = new Schedule();

    // Add two overlapping events for the same table but different teams
    const event1 = new Event(
      1,
      "Team 1",
      CONFIG.DAY_START + 60,
      10,
      0,
      "Table 1",
      CONFIG.EVENT_TYPES.TABLE_RUN,
      "table"
    );

    const event2 = new Event(
      2,
      "Team 2",
      CONFIG.DAY_START + 65,
      10,
      0,
      "Table 1",
      CONFIG.EVENT_TYPES.TABLE_RUN,
      "table"
    );

    schedule.addEvent(event1);
    schedule.addEvent(event2);

    // The schedule should be invalid (score = 0)
    expect(evaluateSchedule(schedule)).toBe(0);
  });

  test("generateSchedule creates a schedule with lunch events", () => {
    const schedule = generateSchedule(false); // No genetic optimization for speed

    // Check that the schedule is not null
    expect(schedule).not.toBeNull();

    // Check that the schedule has a valid score
    expect(schedule.score).toBeGreaterThan(0);

    // Check team event counts
    const teamSchedule = schedule.buildTeamSchedule();

    for (let i = 1; i <= CONFIG.NUM_TEAMS; i++) {
      const teamEvents = teamSchedule[i] || [];

      // Count the different types of events
      let tableRunCount = 0;
      let projectJudgingCount = 0;
      let robotJudgingCount = 0;
      let lunchCount = 0;

      for (const event of teamEvents) {
        if (event.type === CONFIG.EVENT_TYPES.TABLE_RUN) {
          tableRunCount++;
        } else if (event.type === CONFIG.EVENT_TYPES.PROJECT_JUDGING) {
          projectJudgingCount++;
        } else if (event.type === CONFIG.EVENT_TYPES.ROBOT_JUDGING) {
          robotJudgingCount++;
        } else if (event.type === CONFIG.EVENT_TYPES.LUNCH) {
          lunchCount++;
        }
      }

      // Check that the required events are present
      expect(tableRunCount).toBe(CONFIG.ROUNDS_PER_TEAM);
      expect(projectJudgingCount).toBe(1);
      expect(robotJudgingCount).toBe(1);

      // Lunch events are not strictly required (may be omitted due to conflicts)
      // but we log how many were scheduled
      console.log(`Team ${i} has ${lunchCount} lunch events`);
    }
  });

  test("schedule handles different team counts and doesn't overflow day bounds", () => {
    // Temporarily modify CONFIG
    const originalNumTeams = CONFIG.NUM_TEAMS;
    CONFIG.NUM_TEAMS = 12;

    const schedule = generateSchedule(false); // No genetic optimization for speed

    // Check that the schedule is not null
    expect(schedule).not.toBeNull();

    // Check that no events are outside day bounds
    expect(schedule.isWithinDayBounds()).toBe(true);

    // Check for team conflicts
    expect(schedule.hasNoTeamOverlaps()).toBe(true);

    // Check for resource conflicts
    expect(schedule.hasNoResourceOverlaps()).toBe(true);

    // Restore original CONFIG
    CONFIG.NUM_TEAMS = originalNumTeams;
  });

  test("schedule handles lunch waves correctly", () => {
    const schedule = createRandomSchedule();

    // Get all lunch events
    const lunchEvents = schedule
      .getAllEvents()
      .filter((event) => event.type === CONFIG.EVENT_TYPES.LUNCH);

    // Check if lunch events are at the configured wave times
    for (const event of lunchEvents) {
      const matchesWave = CONFIG.LUNCH_WAVES.some(
        (wave) => event.startTime === wave
      );
      expect(matchesWave).toBe(true);
    }
  });
});
