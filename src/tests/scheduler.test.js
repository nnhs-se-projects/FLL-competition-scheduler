/**
 * FLL Competition Scheduler - Scheduler Tests
 *
 * This file contains tests for the scheduler module.
 */

import CONFIG from "./config.js";
import {
  generateSchedule,
  createRandomSchedule,
  evaluateSchedule,
} from "./scheduler.js";
import { Event, Schedule } from "./models.js";

// Mock CONFIG for testing
jest.mock("./config.js", () => ({
  NUM_TEAMS: 8,
  NUM_ROBOT_TABLES: 2,
  NUM_JUDGING_ROOMS: 4,
  ROUNDS_PER_TEAM: 3,
  DURATIONS: {
    TABLE_RUN: 10,
    JUDGING_SESSION: 25,
    JUDGING_BREAK: 10,
    LUNCH_DURATION: 45,
  },
  TIMING: {
    LUNCH_START_TIME: 150,
    TABLE_OFFSETS: [0, 5],
    JUDGING_OFFSETS: [0, 5, 10, 15],
  },
  EVENT_TYPES: {
    TABLE_RUN: "tableRun",
    PROJECT_JUDGING: "projectJudging",
    ROBOT_JUDGING: "robotJudging",
  },
  GENETIC: {
    POPULATION_SIZE: 10,
    GENERATIONS: 5,
    MUTATION_PROBABILITY: 0.1,
    MUTATIONS_PER_SCHEDULE: 2,
    ELITE_PERCENTAGE: 0.2,
  },
  DEBUG: false,
}));

describe("Scheduler Module", () => {
  test("createRandomSchedule generates a valid schedule", () => {
    const schedule = createRandomSchedule();

    // Check that the schedule is not null
    expect(schedule).not.toBeNull();

    // Check that the schedule has the correct number of events
    // Each team has 3 table runs + 2 judging sessions = 5 events per team
    const expectedEventCount = CONFIG.NUM_TEAMS * (CONFIG.ROUNDS_PER_TEAM + 2);
    expect(schedule.getSize()).toBe(expectedEventCount);

    // Check that the schedule has a valid score
    const score = evaluateSchedule(schedule);
    expect(score).toBeGreaterThan(0);
  });

  test("evaluateSchedule correctly identifies invalid schedules", () => {
    // Create a schedule with overlapping events for a team
    const schedule = new Schedule();

    // Add two overlapping events for team 1
    const event1 = new Event(
      1,
      "Team 1",
      100,
      10,
      0,
      "Table 1",
      CONFIG.EVENT_TYPES.TABLE_RUN
    );

    const event2 = new Event(
      1,
      "Team 1",
      105,
      25,
      0,
      "Project Judging Room 1",
      CONFIG.EVENT_TYPES.PROJECT_JUDGING
    );

    schedule.addEvent(event1);
    schedule.addEvent(event2);

    // The schedule should be invalid (score = 0)
    expect(evaluateSchedule(schedule)).toBe(0);
  });

  test("generateSchedule creates a valid schedule", () => {
    const schedule = generateSchedule();

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

      for (const event of teamEvents) {
        if (event.type === CONFIG.EVENT_TYPES.TABLE_RUN) {
          tableRunCount++;
        } else if (event.type === CONFIG.EVENT_TYPES.PROJECT_JUDGING) {
          projectJudgingCount++;
        } else if (event.type === CONFIG.EVENT_TYPES.ROBOT_JUDGING) {
          robotJudgingCount++;
        }
      }

      // Check that the counts are correct
      expect(tableRunCount).toBe(CONFIG.ROUNDS_PER_TEAM);
      expect(projectJudgingCount).toBe(1);
      expect(robotJudgingCount).toBe(1);

      // Check for overlapping team events
      teamEvents.sort((a, b) => a.startTime - b.startTime);

      for (let j = 0; j < teamEvents.length - 1; j++) {
        // Add a 10-minute buffer between events
        expect(teamEvents[j].getEndTime() + 10).toBeLessThanOrEqual(
          teamEvents[j + 1].startTime
        );
      }
    }
  });

  test("schedule handles different team counts", () => {
    // Temporarily modify CONFIG
    const originalNumTeams = CONFIG.NUM_TEAMS;
    CONFIG.NUM_TEAMS = 12;

    const schedule = generateSchedule();

    // Check that the schedule is not null
    expect(schedule).not.toBeNull();

    // Check that the schedule has the correct number of events
    // Each team has 3 table runs + 2 judging sessions = 5 events per team
    const expectedEventCount = CONFIG.NUM_TEAMS * (CONFIG.ROUNDS_PER_TEAM + 2);
    expect(schedule.getSize()).toBe(expectedEventCount);

    // Restore original CONFIG
    CONFIG.NUM_TEAMS = originalNumTeams;
  });

  test("schedule handles odd number of teams", () => {
    // Temporarily modify CONFIG
    const originalNumTeams = CONFIG.NUM_TEAMS;
    CONFIG.NUM_TEAMS = 9;

    const schedule = generateSchedule();

    // Check that the schedule is not null
    expect(schedule).not.toBeNull();

    // Check that the schedule has the correct number of events
    // Each team has 3 table runs + 2 judging sessions = 5 events per team
    const expectedEventCount = CONFIG.NUM_TEAMS * (CONFIG.ROUNDS_PER_TEAM + 2);
    expect(schedule.getSize()).toBe(expectedEventCount);

    // Restore original CONFIG
    CONFIG.NUM_TEAMS = originalNumTeams;
  });
});
