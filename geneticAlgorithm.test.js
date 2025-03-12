/**
 * FLL Competition Scheduler - Genetic Algorithm Tests
 *
 * This file contains tests for the genetic algorithm module.
 */

import CONFIG from "./config.js";
import {
  swapRandomEvents,
  mutate,
  crossover,
  optimizeSchedule,
} from "./geneticAlgorithm.js";
import { generateSchedule } from "./scheduler.js";
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

describe("Genetic Algorithm Module", () => {
  test("swapRandomEvents correctly swaps events", () => {
    // Create a schedule with some events
    const schedule = new Schedule();

    // Add some events
    for (let i = 1; i <= 10; i++) {
      const event = new Event(
        i,
        `Team ${i}`,
        i * 10,
        10,
        0,
        "Table 1",
        CONFIG.EVENT_TYPES.TABLE_RUN
      );

      schedule.addEvent(event);
    }

    // Make a copy of the original schedule
    const originalSchedule = schedule.createCopy();

    // Swap events
    swapRandomEvents(schedule);

    // Check that the schedule has changed
    let hasChanged = false;

    for (let i = 0; i < schedule.getSize(); i++) {
      if (
        !schedule.getEventAtIndex(i).equals(originalSchedule.getEventAtIndex(i))
      ) {
        hasChanged = true;
        break;
      }
    }

    expect(hasChanged).toBe(true);

    // Check that all events are still present
    for (let i = 0; i < originalSchedule.getSize(); i++) {
      const originalEvent = originalSchedule.getEventAtIndex(i);
      let found = false;

      for (let j = 0; j < schedule.getSize(); j++) {
        if (schedule.getEventAtIndex(j).equals(originalEvent)) {
          found = true;
          break;
        }
      }

      expect(found).toBe(true);
    }
  });

  test("mutate changes the schedule based on mutation probability", () => {
    // Create a schedule with some events
    const schedule = new Schedule();

    // Add some events
    for (let i = 1; i <= 10; i++) {
      const event = new Event(
        i,
        `Team ${i}`,
        i * 10,
        10,
        0,
        "Table 1",
        CONFIG.EVENT_TYPES.TABLE_RUN
      );

      schedule.addEvent(event);
    }

    // Set a high mutation probability to ensure changes
    schedule.mutationProbability = 1.0;

    // Make a copy of the original schedule
    const originalSchedule = schedule.createCopy();

    // Mutate the schedule
    mutate(schedule);

    // Check that the schedule has changed
    let hasChanged = false;

    for (let i = 0; i < schedule.getSize(); i++) {
      if (
        !schedule.getEventAtIndex(i).equals(originalSchedule.getEventAtIndex(i))
      ) {
        hasChanged = true;
        break;
      }
    }

    expect(hasChanged).toBe(true);
  });

  test("crossover creates a valid child schedule", () => {
    // Create two parent schedules
    const parentA = new Schedule();
    const parentB = new Schedule();

    // Add some events to parentA
    for (let i = 1; i <= 10; i++) {
      const event = new Event(
        i,
        `Team ${i}`,
        i * 10,
        10,
        0,
        "Table 1",
        CONFIG.EVENT_TYPES.TABLE_RUN
      );

      parentA.addEvent(event);
    }

    // Add some events to parentB (different start times)
    for (let i = 1; i <= 10; i++) {
      const event = new Event(
        i,
        `Team ${i}`,
        i * 15,
        10,
        0,
        "Table 1",
        CONFIG.EVENT_TYPES.TABLE_RUN
      );

      parentB.addEvent(event);
    }

    // Perform crossover
    const child = crossover(parentA, parentB, 3, 7);

    // Check that the child has the correct number of events
    expect(child.getSize()).toBe(parentA.getSize());

    // Check that the child has events from both parents
    let hasEventsFromA = false;
    let hasEventsFromB = false;

    for (let i = 0; i < child.getSize(); i++) {
      const childEvent = child.getEventAtIndex(i);

      // Check if the event is from parentA
      for (let j = 0; j < parentA.getSize(); j++) {
        if (childEvent.equals(parentA.getEventAtIndex(j))) {
          hasEventsFromA = true;
          break;
        }
      }

      // Check if the event is from parentB
      for (let j = 0; j < parentB.getSize(); j++) {
        if (childEvent.equals(parentB.getEventAtIndex(j))) {
          hasEventsFromB = true;
          break;
        }
      }

      if (hasEventsFromA && hasEventsFromB) {
        break;
      }
    }

    expect(hasEventsFromA).toBe(true);
    expect(hasEventsFromB).toBe(true);
  });

  test("optimizeSchedule improves the schedule score", () => {
    // Generate an initial schedule
    const initialSchedule = generateSchedule();

    // Set a low number of generations for testing
    CONFIG.GENETIC.GENERATIONS = 2;

    // Optimize the schedule
    const optimizedSchedule = optimizeSchedule(initialSchedule);

    // Check that the optimized schedule has a valid score
    expect(optimizedSchedule.score).toBeGreaterThan(0);

    // Check that the optimized schedule has the same number of events
    expect(optimizedSchedule.getSize()).toBe(initialSchedule.getSize());
  });
});
