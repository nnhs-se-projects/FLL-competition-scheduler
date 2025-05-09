/**
 * FLL Competition Scheduler Models
 *
 * This file contains the core data structures used in the scheduling system.
 */

import CONFIG from "./config.js";

/**
 * Represents a scheduled event in the competition
 */
class Event {
  /**
   * Create a new event
   * @param {number} teamId - The team's unique identifier
   * @param {string} teamName - The team's name
   * @param {number} startTime - Start time in minutes from the beginning of the day
   * @param {number} duration - Duration of the event in minutes
   * @param {number} locationId - The location's unique identifier
   * @param {string} locationName - The location's name
   * @param {string} type - The type of event (tableRun, projectJudging, robotJudging, lunch)
   * @param {string} resourceType - The type of resource ("table" or "judging" or "other")
   */
  constructor(
    teamId,
    teamName,
    startTime,
    duration,
    locationId,
    locationName,
    type,
    resourceType = null
  ) {
    this.teamId = teamId;
    this.teamName = teamName;
    this.startTime = startTime;
    this.duration = duration;
    this.locationId = locationId;
    this.locationName = locationName;
    this.type = type;

    // Auto-detect resource type if not provided
    if (!resourceType) {
      if (type === CONFIG.EVENT_TYPES.TABLE_RUN) {
        this.resourceType = "table";
      } else if (
        type === CONFIG.EVENT_TYPES.PROJECT_JUDGING ||
        type === CONFIG.EVENT_TYPES.ROBOT_JUDGING
      ) {
        this.resourceType = "judging";
      } else if (type === CONFIG.EVENT_TYPES.LUNCH) {
        this.resourceType = "other";
      } else {
        this.resourceType = "other";
      }
    } else {
      this.resourceType = resourceType;
    }
  }

  /**
   * Check if this event equals another event
   * @param {Event} otherEvent - The event to compare with
   * @returns {boolean} True if the events are equal
   */
  equals(otherEvent) {
    return (
      this.teamId === otherEvent.teamId &&
      this.teamName === otherEvent.teamName &&
      this.startTime === otherEvent.startTime &&
      this.duration === otherEvent.duration &&
      this.locationId === otherEvent.locationId &&
      this.locationName === otherEvent.locationName &&
      this.type === otherEvent.type &&
      this.resourceType === otherEvent.resourceType
    );
  }

  /**
   * Create a copy of this event
   * @returns {Event} A new event with the same properties
   */
  copy() {
    return new Event(
      this.teamId,
      this.teamName,
      this.startTime,
      this.duration,
      this.locationId,
      this.locationName,
      this.type,
      this.resourceType
    );
  }

  /**
   * Get the end time of this event
   * @returns {number} The end time in minutes from the beginning of the day
   */
  getEndTime() {
    return this.startTime + this.duration;
  }

  /**
   * Check if this event overlaps with another event
   * @param {Event} otherEvent - The event to check for overlap
   * @param {number} buffer - Additional buffer time to consider (in minutes)
   * @returns {boolean} True if the events overlap
   */
  overlaps(otherEvent, buffer = 0) {
    return (
      this.startTime < otherEvent.getEndTime() + buffer &&
      this.getEndTime() + buffer > otherEvent.startTime
    );
  }

  /**
   * Create a resource key for this event
   * @returns {string} A unique identifier for this event's resource
   */
  getResourceKey() {
    return `${this.resourceType}-${this.locationId}`;
  }

  /**
   * Check if this event is within the day bounds
   * @returns {boolean} True if the event is within day bounds
   */
  isWithinDayBounds() {
    return (
      this.startTime >= CONFIG.DAY_START && this.getEndTime() <= CONFIG.DAY_END
    );
  }
}

/**
 * Represents a complete schedule for the FLL competition
 */
class Schedule {
  constructor() {
    this.events = [];
    this.byTeam = new Map(); // Map<teamId, Event[]>
    this.byResource = new Map(); // Map<resourceKey, Event[]>
    this.score = 0;
    this.mutationProbability = CONFIG.GENETIC.MUTATION_PROBABILITY;
    this.numberOfPotentialMutations = CONFIG.GENETIC.MUTATIONS_PER_SCHEDULE;
  }

  /**
   * Add an event to the schedule
   * @param {Event} event - The event to add
   */
  addEvent(event) {
    this.events.push(event);

    // Add to byTeam index
    if (!this.byTeam.has(event.teamId)) {
      this.byTeam.set(event.teamId, []);
    }
    this.byTeam.get(event.teamId).push(event);

    // Add to byResource index
    const resourceKey = event.getResourceKey();
    if (!this.byResource.has(resourceKey)) {
      this.byResource.set(resourceKey, []);
    }
    this.byResource.get(resourceKey).push(event);
  }

  /**
   * Get all events in the schedule
   * @returns {Event[]} All events
   */
  getAllEvents() {
    return this.events;
  }

  /**
   * Get events for a specific team
   * @param {number} teamId - The team's ID
   * @returns {Event[]} Events for the team
   */
  getTeamEvents(teamId) {
    return this.byTeam.get(teamId) || [];
  }

  /**
   * Get events for a specific resource
   * @param {string} resourceKey - The resource key
   * @returns {Event[]} Events for the resource
   */
  getResourceEvents(resourceKey) {
    return this.byResource.get(resourceKey) || [];
  }

  /**
   * Create a deep copy of this schedule
   * @returns {Schedule} A new schedule with copied events
   */
  createCopy() {
    const copy = new Schedule();
    for (const event of this.events) {
      copy.addEvent(event.copy());
    }
    copy.score = this.score;
    return copy;
  }

  /**
   * Get the number of events in the schedule
   * @returns {number} The number of events
   */
  getSize() {
    return this.events.length;
  }

  /**
   * Get events in a specific range
   * @param {number} start - Start index (inclusive)
   * @param {number} end - End index (exclusive)
   * @returns {Event[]} Events in the range
   */
  getEventsInRange(start, end) {
    return this.events.slice(start, end);
  }

  /**
   * Get an event at a specific index
   * @param {number} index - The index
   * @returns {Event} The event
   */
  getEventAtIndex(index) {
    return this.events[index];
  }

  /**
   * Replace events in a specific range
   * @param {number} start - Start index (inclusive)
   * @param {number} end - End index (exclusive)
   * @param {Event[]} events - New events
   */
  replaceEventsInRange(start, end, events) {
    // First, remove old events from indexes
    const oldEvents = this.events.slice(start, end);
    for (const event of oldEvents) {
      this.removeFromIndexes(event);
    }

    // Then replace in main array
    this.events.splice(start, end - start, ...events);

    // Add new events to indexes
    for (const event of events) {
      this.addToIndexes(event);
    }
  }

  /**
   * Replace an event at a specific index
   * @param {number} index - The index
   * @param {Event} event - The new event
   */
  replaceEventAtIndex(index, event) {
    // Remove old event from indexes
    this.removeFromIndexes(this.events[index]);

    // Replace in main array
    this.events[index] = event;

    // Add new event to indexes
    this.addToIndexes(event);
  }

  /**
   * Remove an event from the indexes
   * @param {Event} event - The event to remove
   * @private
   */
  removeFromIndexes(event) {
    // Remove from byTeam
    if (this.byTeam.has(event.teamId)) {
      this.byTeam.set(
        event.teamId,
        this.byTeam.get(event.teamId).filter((e) => !e.equals(event))
      );
    }

    // Remove from byResource
    const resourceKey = event.getResourceKey();
    if (this.byResource.has(resourceKey)) {
      this.byResource.set(
        resourceKey,
        this.byResource.get(resourceKey).filter((e) => !e.equals(event))
      );
    }
  }

  /**
   * Add an event to the indexes
   * @param {Event} event - The event to add
   * @private
   */
  addToIndexes(event) {
    // Add to byTeam
    if (!this.byTeam.has(event.teamId)) {
      this.byTeam.set(event.teamId, []);
    }
    this.byTeam.get(event.teamId).push(event);

    // Add to byResource
    const resourceKey = event.getResourceKey();
    if (!this.byResource.has(resourceKey)) {
      this.byResource.set(resourceKey, []);
    }
    this.byResource.get(resourceKey).push(event);
  }

  /**
   * Sort events by start time
   */
  sortByStartTime() {
    this.events.sort((a, b) => a.startTime - b.startTime);

    // Sort the indexes as well
    for (const [teamId, events] of this.byTeam.entries()) {
      this.byTeam.set(
        teamId,
        events.sort((a, b) => a.startTime - b.startTime)
      );
    }

    for (const [resourceKey, events] of this.byResource.entries()) {
      this.byResource.set(
        resourceKey,
        events.sort((a, b) => a.startTime - b.startTime)
      );
    }
  }

  /**
   * Build a schedule organized by teams
   * @returns {Object} Schedule by teams
   */
  buildTeamSchedule() {
    const teamSchedule = {};

    // Convert Map to object for compatibility with existing code
    for (const [teamId, events] of this.byTeam.entries()) {
      teamSchedule[teamId] = [...events].sort(
        (a, b) => a.startTime - b.startTime
      );
    }

    return teamSchedule;
  }

  /**
   * Build a schedule organized by table locations
   * @returns {Object} Schedule by tables
   */
  buildTableSchedule() {
    const tableSchedule = {};

    // Get table events from byResource
    for (let i = 0; i < CONFIG.NUM_ROBOT_TABLES; i++) {
      const resourceKey = `table-${i}`;
      tableSchedule[i] = this.getResourceEvents(resourceKey).sort(
        (a, b) => a.startTime - b.startTime
      );
    }

    return tableSchedule;
  }

  /**
   * Build a schedule organized by judging rooms
   * @returns {Object} Schedule by judging rooms
   */
  buildJudgingSchedule() {
    const judgingSchedule = {};

    // Get judging events from byResource
    for (let i = 0; i < CONFIG.NUM_JUDGING_ROOMS; i++) {
      const resourceKey = `judging-${i}`;
      judgingSchedule[i] = this.getResourceEvents(resourceKey).sort(
        (a, b) => a.startTime - b.startTime
      );
    }

    return judgingSchedule;
  }

  /**
   * Check if all events are within day bounds
   * @returns {boolean} True if all events are within day bounds
   */
  isWithinDayBounds() {
    for (const event of this.events) {
      if (!event.isWithinDayBounds()) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if any team has overlapping events (with buffer)
   * @param {number} buffer - Buffer time in minutes
   * @returns {boolean} True if no overlaps found
   */
  hasNoTeamOverlaps(buffer = CONFIG.DURATIONS.MIN_TRANSITION_TIME) {
    for (const [teamId, events] of this.byTeam.entries()) {
      const sortedEvents = [...events].sort(
        (a, b) => a.startTime - b.startTime
      );

      for (let i = 0; i < sortedEvents.length - 1; i++) {
        if (sortedEvents[i].overlaps(sortedEvents[i + 1], buffer)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Check if any resource has overlapping events (with buffer)
   * @param {number} buffer - Buffer time in minutes
   * @returns {boolean} True if no overlaps found
   */
  hasNoResourceOverlaps(buffer = 0) {
    for (const [resourceKey, events] of this.byResource.entries()) {
      const sortedEvents = [...events].sort(
        (a, b) => a.startTime - b.startTime
      );

      for (let i = 0; i < sortedEvents.length - 1; i++) {
        // Use appropriate buffer based on resource type
        let resourceBuffer = buffer;
        if (resourceKey.startsWith("table-")) {
          resourceBuffer = CONFIG.DURATIONS.TABLE_BUFFER;
        } else if (resourceKey.startsWith("judging-")) {
          resourceBuffer = CONFIG.DURATIONS.JUDGE_BUFFER;
        }

        if (sortedEvents[i].overlaps(sortedEvents[i + 1], resourceBuffer)) {
          return false;
        }
      }
    }
    return true;
  }
}

export { Event, Schedule };
