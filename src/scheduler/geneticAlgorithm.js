/**
 * FLL Competition Scheduler - Genetic Algorithm
 *
 * This file contains the genetic algorithm implementation for optimizing FLL competition schedules.
 */

import CONFIG from "./config.js";
import { evaluateSchedule } from "../scheduler/scheduler.js";

/**
 * Pick a random integer in range [min, max)
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} Random integer
 */
function randRange(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Swap two random events in a schedule, ensuring they're of the same resource type
 * @param {Schedule} schedule - The schedule to modify
 * @returns {boolean} True if swap was successful
 */
function swapRandomEvents(schedule) {
  // First pick a random resource type to focus on
  const resourceTypes = ["table", "judging"];
  const resourceType =
    resourceTypes[Math.floor(Math.random() * resourceTypes.length)];

  // Get all events of this resource type
  const eventsOfType = schedule.events.filter(
    (event) => event.resourceType === resourceType
  );

  // If not enough events to swap, return false
  if (eventsOfType.length < 2) {
    return false;
  }

  // Find two events that can be swapped safely
  let maxAttempts = 10;
  let attempts = 0;
  let swapSuccessful = false;

  while (!swapSuccessful && attempts < maxAttempts) {
    attempts++;

    // Select two random events
    const eventIndex1 = Math.floor(Math.random() * eventsOfType.length);
    let eventIndex2 = Math.floor(Math.random() * eventsOfType.length);

    // Ensure we pick two different events
    while (eventIndex1 === eventIndex2) {
      eventIndex2 = Math.floor(Math.random() * eventsOfType.length);
    }

    const event1 = eventsOfType[eventIndex1];
    const event2 = eventsOfType[eventIndex2];

    // Only swap events with the same duration and same team
    if (
      event1.duration !== event2.duration ||
      event1.teamId !== event2.teamId
    ) {
      continue;
    }

    // Now find these events in the main schedule
    const scheduleIndex1 = schedule.events.findIndex((e) => e === event1);
    const scheduleIndex2 = schedule.events.findIndex((e) => e === event2);

    if (scheduleIndex1 === -1 || scheduleIndex2 === -1) {
      continue;
    }

    // Make backup copies before the swap
    const originalEvent1 = event1.copy();
    const originalEvent2 = event2.copy();

    // Swap just the start times and locations
    const tempStartTime = event1.startTime;
    const tempLocationId = event1.locationId;
    const tempLocationName = event1.locationName;

    event1.startTime = event2.startTime;
    event1.locationId = event2.locationId;
    event1.locationName = event2.locationName;

    event2.startTime = tempStartTime;
    event2.locationId = tempLocationId;
    event2.locationName = tempLocationName;

    // Replace events in schedule with updated versions
    schedule.replaceEventAtIndex(scheduleIndex1, event1);
    schedule.replaceEventAtIndex(scheduleIndex2, event2);

    // Check if the swap created any conflicts
    if (!schedule.hasNoTeamOverlaps() || !schedule.hasNoResourceOverlaps()) {
      // Restore the original events if there's a conflict
      schedule.replaceEventAtIndex(scheduleIndex1, originalEvent1);
      schedule.replaceEventAtIndex(scheduleIndex2, originalEvent2);
    } else {
      swapSuccessful = true;
    }
  }

  return swapSuccessful;
}

/**
 * Shift an event's start time to resolve a conflict
 * @param {Schedule} schedule - The schedule containing the event
 * @param {Event} event - The event to shift
 * @param {number} minBuffer - Minimum buffer time required
 * @returns {boolean} True if shift was successful
 */
function shiftEventTime(
  schedule,
  event,
  minBuffer = CONFIG.DURATIONS.MIN_TRANSITION_TIME
) {
  // Get all events for this team and resource
  const teamEvents = schedule
    .getTeamEvents(event.teamId)
    .filter((e) => e !== event);
  const resourceEvents = schedule
    .getResourceEvents(event.getResourceKey())
    .filter((e) => e !== event);

  // Sort all events by start time
  teamEvents.sort((a, b) => a.startTime - b.startTime);
  resourceEvents.sort((a, b) => a.startTime - b.startTime);

  // Find valid time slots
  const validSlots = [];

  // Start with the entire day as a potential slot
  validSlots.push({
    start: CONFIG.DAY_START,
    end: CONFIG.DAY_END - event.duration,
  });

  // Remove slots occupied by team events (with buffer)
  for (const teamEvent of teamEvents) {
    for (let i = 0; i < validSlots.length; i++) {
      const slot = validSlots[i];

      // Event starts before slot and ends after slot start
      if (
        teamEvent.startTime - minBuffer < slot.start &&
        teamEvent.getEndTime() + minBuffer > slot.start
      ) {
        // Adjust slot start time
        slot.start = teamEvent.getEndTime() + minBuffer;
      }
      // Event starts in the middle of the slot
      else if (
        teamEvent.startTime - minBuffer >= slot.start &&
        teamEvent.startTime - minBuffer < slot.end
      ) {
        // Split the slot
        const newSlot = {
          start: slot.start,
          end: teamEvent.startTime - minBuffer,
        };

        // Adjust original slot
        slot.start = teamEvent.getEndTime() + minBuffer;

        // Add new slot if it's valid
        if (newSlot.end > newSlot.start) {
          validSlots.splice(i, 0, newSlot);
          i++; // Skip the slot we just added
        }
      }

      // Remove invalid slots
      if (slot.end <= slot.start) {
        validSlots.splice(i, 1);
        i--;
      }
    }
  }

  // Remove slots occupied by resource events (with resource-specific buffer)
  const resourceBuffer =
    event.resourceType === "table"
      ? CONFIG.DURATIONS.TABLE_BUFFER
      : CONFIG.DURATIONS.JUDGE_BUFFER;

  for (const resourceEvent of resourceEvents) {
    for (let i = 0; i < validSlots.length; i++) {
      const slot = validSlots[i];

      // Similar logic as team events
      if (
        resourceEvent.startTime - resourceBuffer < slot.start &&
        resourceEvent.getEndTime() + resourceBuffer > slot.start
      ) {
        slot.start = resourceEvent.getEndTime() + resourceBuffer;
      } else if (
        resourceEvent.startTime - resourceBuffer >= slot.start &&
        resourceEvent.startTime - resourceBuffer < slot.end
      ) {
        const newSlot = {
          start: slot.start,
          end: resourceEvent.startTime - resourceBuffer,
        };

        slot.start = resourceEvent.getEndTime() + resourceBuffer;

        if (newSlot.end > newSlot.start) {
          validSlots.splice(i, 0, newSlot);
          i++;
        }
      }

      if (slot.end <= slot.start) {
        validSlots.splice(i, 1);
        i--;
      }
    }
  }

  // No valid slots found
  if (validSlots.length === 0) {
    return false;
  }

  // Choose a random valid slot
  const randomSlot = validSlots[Math.floor(Math.random() * validSlots.length)];

  // Choose a random time within the slot
  const slotRange = randomSlot.end - randomSlot.start;
  const newStartTime = Math.floor(randomSlot.start + Math.random() * slotRange);

  // Update the event
  event.startTime = newStartTime;

  return true;
}

/**
 * Mutate a schedule by swapping random events and shifting event times
 * @param {Schedule} schedule - The schedule to mutate
 */
function mutate(schedule) {
  let mutationCount = 0;

  // Try to mutate at least once successfully
  while (mutationCount === 0) {
    for (let i = 0; i < schedule.numberOfPotentialMutations; i++) {
      if (Math.random() < schedule.mutationProbability) {
        // 50% chance of swap vs shift
        if (Math.random() < 0.5) {
          // Try to swap events
          if (swapRandomEvents(schedule)) {
            mutationCount++;
          }
        } else {
          // Try to shift a random event
          const eventIndex = randRange(0, schedule.getSize());
          const event = schedule.getEventAtIndex(eventIndex);
          const originalStartTime = event.startTime;

          if (shiftEventTime(schedule, event)) {
            // Only count it as a mutation if the time actually changed
            if (event.startTime !== originalStartTime) {
              mutationCount++;
            }
          }
        }
      }
    }

    // If we failed to mutate, try one more time with higher probability
    if (mutationCount === 0) {
      if (swapRandomEvents(schedule)) {
        mutationCount++;
      }
    }
  }

  // Re-evaluate the schedule after mutation
  schedule.score = evaluateSchedule(schedule);
}

/**
 * Create a child schedule by crossing over two parent schedules
 * @param {Schedule} parentA - The first parent schedule
 * @param {Schedule} parentB - The second parent schedule
 * @returns {Schedule} The child schedule
 */
function crossover(parentA, parentB) {
  const child = parentA.createCopy();

  // For each team, perform a dedicated crossover
  for (let teamId = 1; teamId <= CONFIG.NUM_TEAMS; teamId++) {
    // Get team events from each parent
    const teamEventsA = parentA
      .getTeamEvents(teamId)
      .sort((a, b) => a.startTime - b.startTime);
    const teamEventsB = parentB
      .getTeamEvents(teamId)
      .sort((a, b) => a.startTime - b.startTime);

    // Skip if either parent doesn't have events for this team
    if (teamEventsA.length === 0 || teamEventsB.length === 0) {
      continue;
    }

    // Two-point crossover: select random crossover points
    const x1 = randRange(0, teamEventsA.length - 1);
    const x2 = randRange(x1 + 1, teamEventsA.length);

    // Create new team events for child
    const childTeamEvents = [];

    // Copy first segment from parent A
    for (let i = 0; i < x1; i++) {
      childTeamEvents.push(teamEventsA[i].copy());
    }

    // Copy middle segment from parent B, finding equivalent events by type
    for (let i = x1; i < x2; i++) {
      // Find matching event type in parent B
      const eventType = teamEventsA[i].type;
      const matchingEvents = teamEventsB.filter((e) => e.type === eventType);

      // If found, add it to child events
      if (matchingEvents.length > 0) {
        // Use the first match (they should be sorted by start time)
        childTeamEvents.push(matchingEvents[0].copy());

        // Remove this event from B to avoid duplicates
        const index = teamEventsB.indexOf(matchingEvents[0]);
        if (index !== -1) {
          teamEventsB.splice(index, 1);
        }
      } else {
        // No match found, use event from parent A
        childTeamEvents.push(teamEventsA[i].copy());
      }
    }

    // Copy last segment from parent A
    for (let i = x2; i < teamEventsA.length; i++) {
      childTeamEvents.push(teamEventsA[i].copy());
    }

    // Replace all team events in child
    for (const event of child.getTeamEvents(teamId)) {
      child.events = child.events.filter((e) => e !== event);
    }

    // Add the new events to the child
    for (const event of childTeamEvents) {
      child.addEvent(event);
    }
  }

  // Fix any conflicts after crossover
  repairSchedule(child);

  // Evaluate the child schedule
  child.score = evaluateSchedule(child);

  return child;
}

/**
 * Repair a schedule by resolving conflicts
 * @param {Schedule} schedule - The schedule to repair
 */
function repairSchedule(schedule) {
  // Sort events by start time
  schedule.sortByStartTime();

  // Find and fix team conflicts
  for (let teamId = 1; teamId <= CONFIG.NUM_TEAMS; teamId++) {
    const teamEvents = schedule
      .getTeamEvents(teamId)
      .sort((a, b) => a.startTime - b.startTime);

    // Check for overlapping events
    for (let i = 0; i < teamEvents.length - 1; i++) {
      if (
        teamEvents[i].overlaps(
          teamEvents[i + 1],
          CONFIG.DURATIONS.MIN_TRANSITION_TIME
        )
      ) {
        // Try to shift the later event
        shiftEventTime(schedule, teamEvents[i + 1]);
      }
    }
  }

  // Find and fix resource conflicts
  for (const [resourceKey, events] of schedule.byResource.entries()) {
    const resourceEvents = [...events].sort(
      (a, b) => a.startTime - b.startTime
    );

    // Get proper buffer for this resource type
    let resourceBuffer = 0;
    if (resourceKey.startsWith("table-")) {
      resourceBuffer = CONFIG.DURATIONS.TABLE_BUFFER;
    } else if (resourceKey.startsWith("judging-")) {
      resourceBuffer = CONFIG.DURATIONS.JUDGE_BUFFER;
    }

    // Check for overlapping events
    for (let i = 0; i < resourceEvents.length - 1; i++) {
      if (resourceEvents[i].overlaps(resourceEvents[i + 1], resourceBuffer)) {
        // Try to shift the later event
        shiftEventTime(schedule, resourceEvents[i + 1]);
      }
    }
  }

  // Check for events outside day bounds
  for (const event of schedule.events) {
    if (!event.isWithinDayBounds()) {
      // Try to shift the event within day bounds
      event.startTime = Math.max(CONFIG.DAY_START, event.startTime);
      event.startTime = Math.min(
        CONFIG.DAY_END - event.duration,
        event.startTime
      );

      // If there are still conflicts, try to resolve them
      if (!schedule.hasNoTeamOverlaps() || !schedule.hasNoResourceOverlaps()) {
        shiftEventTime(schedule, event);
      }
    }
  }
}

/**
 * Optimize a schedule using a genetic algorithm
 * @param {Schedule} initialSchedule - The initial schedule to optimize
 * @returns {Schedule} The optimized schedule
 */
function optimizeSchedule(initialSchedule) {
  const popSize = CONFIG.GENETIC.POPULATION_SIZE;
  const generations = CONFIG.GENETIC.GENERATIONS;
  const elitePercentage = CONFIG.GENETIC.ELITE_PERCENTAGE;

  // Create the initial population
  let oldPool = new Array(popSize);
  let newPool = new Array(popSize);

  // Initialize the first schedule
  oldPool[0] = initialSchedule;

  // Create variations of the initial schedule
  for (let i = 1; i < popSize; i++) {
    oldPool[i] = initialSchedule.createCopy();
    mutate(oldPool[i]);
  }

  // Sort the initial population by score
  oldPool.sort((a, b) => b.score - a.score);

  console.log(`Initial best schedule score: ${oldPool[0].score.toFixed(4)}`);

  // Evolve the population for the specified number of generations
  for (let generation = 0; generation < generations; generation++) {
    let newPoolIndex = 0;

    // Determine how many elites to keep
    const eliteCount = Math.floor(popSize * elitePercentage);

    // Copy the elite schedules to the new pool
    for (let i = 0; i < eliteCount; i++) {
      newPool[newPoolIndex++] = oldPool[i];
    }

    // Create new schedules through crossover and mutation
    while (newPoolIndex < popSize) {
      // Select two parents from the top half of the pool using tournament selection
      const parentA = tournamentSelect(oldPool, 3);
      const parentB = tournamentSelect(oldPool, 3);

      // Create a child through crossover
      const child = crossover(parentA, parentB);

      // Mutate the child
      mutate(child);

      // Add the child to the new pool
      newPool[newPoolIndex++] = child;
    }

    // Swap the pools
    [oldPool, newPool] = [newPool, oldPool];

    // Sort the new current pool by score
    oldPool.sort((a, b) => b.score - a.score);

    // Log progress every few generations
    if (generation % 5 === 0 || generation === generations - 1) {
      console.log(
        `Generation ${generation}: Best score = ${oldPool[0].score.toFixed(4)}`
      );
    }
  }

  return oldPool[0];
}

/**
 * Tournament selection - pick the best schedule from a random subset
 * @param {Array} pool - The pool of schedules
 * @param {number} tournamentSize - Number of schedules to include in each tournament
 * @returns {Schedule} The selected schedule
 */
function tournamentSelect(pool, tournamentSize) {
  // Select random candidates
  const candidates = [];
  for (let i = 0; i < tournamentSize; i++) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    candidates.push(pool[randomIndex]);
  }

  // Return the best candidate
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0];
}

export { swapRandomEvents, mutate, crossover, optimizeSchedule };
